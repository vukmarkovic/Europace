import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { keyBy } from 'lodash';
import moment = require('moment');
import { v4 as uuid4 } from 'uuid';
import ApiField from './models/entities/api.field.entity';
import Matching from './models/entities/matching.entity';
import DefaultMatching from './models/entities/default.matching';
import { BxApiService } from '../bxapi/bx.api.service';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import BX_ENTITY from '../bxapi/models/constants/bx.entity';
import MatchDto from './models/dto/match.dto';
import BxApiResult from '../bxapi/models/bx.api.result';
import IBxApiCall from '../bxapi/models/intefaces/bx.api.call';
import FieldDto from './models/dto/field.dto';
import TypedValues from './models/enums/typed.values';
import BX_FIELD_TYPE from '../bxapi/models/constants/bx.field.type';
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';

/**
 * Sets a value to the resulting object with a nested structure.
 * @param object - target object.
 * @param props -property path.
 * @param idx - index of property in property path.
 * @param value - value to set.
 */
function setValue(object: any, props: string[], idx: number, value: any) {
    if (idx === props.length - 1) {
        object[props[idx]] = value;
    } else {
        const prop = props[idx].replace('[]', '');
        if (!object[prop]) {
            object[prop] = props[idx].includes('[]') ? [{}] : {};
        }
        setValue(object[prop][0] ?? object[props[idx]], props, ++idx, value);
    }
}

const DEFAULT_TIME_ZONE = 3; // MSK;

/**
 * Gets a value from the object with a nested structure.
 * @param object - source object.
 * @param props - property path.
 * @param idx - index of property in property path.
 * @return - value of target property.
 */
function getValue(object: any, props: string[], idx: number) {
    if (!object) return object;

    const prop = props[idx].replace('[]', '');
    if (idx === props.length - 1) {
        return object[prop];
    } else {
        return getValue(Array.isArray(object[prop]) ? object[prop][0] : object[prop], props, ++idx);
    }
}

/**
 * Service used for match data between Bitrix24 and any external API.
 * Realizes optimised batch calls fo getting and saving data.
 *
 * Provides:
 * - matching settings;
 * - converting data from Bitrix24 instances to external API instances;
 * - saving external API data to Bitrix24 entities;
 * - initial matching settings;
 * - default matching for known Bitrix24 fields;
 * - test methods for getting and saving data debugging;
 * - helpers for correct save data generation.
 *
 * In common cases there's no need for additional data processing.
 * Get or save methods do the hole job by matching entity only:
 * - links Bitrix24 entities;
 * - extracts properties from non-primitive values;
 * - extracts values from linked entities;
 * - fills default values;
 * - prepares specific data before saving/after receiving (e.g. PHONES, booleans)
 *
 * @example get Bitrix24 Contact as external api Customer.
 * // Consider, we have some `contact`
 * // {
 * //    ID: 1,
 * //    ACTIVE: 'Y',
 * //    NAME: 'name',
 * //    LAST_NAME: 'lastName',
 * //    PHONE: [{VALUE: '1', TYPE: 'MOBILE'}, {VALUE: '2', TYPE: 'WORK'}],
 * //    COMPANY_ID: 42, // Bitrix24 company link
 * //    UF_DISCOUNT_STATUS: 37 // iblock link
 * //    UF_UNMATCHED_FIELD: 'any string'
 * // }
 * // With `address`
 * // {
 * //    ADDRESS: 'some address view`,
 * //    COUNTRY: 'Russia',
 * //    INDEX: '123456'
 * // }
 * // And `company`
 * // {
 * //    ID: 42,
 * //    TITLE: 'company'
 * // }
 *
 * // With the matching stored in the database we got:
 *
 * const customer = await matchingService.prepareData(
 *    auth, 'CUSTOMER', { id: 1 }, { CUSTOMER: ['UF_UNMATCHED_FIELD'] });
 * console.log(customer);
 * // =>
 * // {
 * //    active: true,
 * //    name: 'name',
 * //    surname: 'lastName',
 * //    phones: {
 * //       mobile: '1',
 * //       work: '2'
 * //    },
 * //    address: {
 * //       postCode: '123456',
 * //       country: 'Russia',
 * //       addressView: 'some address view'
 * //    },
 * //    discountStatus: 'GUEST',
 * //    UF_UNMATCHED_FIELD: 'any string',
 * //    company: {
 * //       name: 'company'
 * //    }
 * // }
 *
 * @example same works in other side:
 * // The following call results in Bitrix24 contact described earlier.
 * await matchingService.saveData(auth, {
 *    CUSTOMER: {
 *       0: [ customer ], // adds contact(s) to Bitrix24
 *       1: customer // updates Bitrix24 contact with ID = 1
 *    });
 * }
 *
 * Uses:
 * - Bitrix24 API integration;
 * - fields, matches and default matches repositories.
 */
@Injectable()
export default class MatchingService {
    private readonly logger = new Logger(MatchingService.name);

    constructor(
        @InjectRepository(ApiField) private readonly fieldRepository: Repository<ApiField>,
        @InjectRepository(Matching) private readonly matchRepository: Repository<Matching>,
        @InjectRepository(DefaultMatching) private readonly defaultMatchingRepository: Repository<DefaultMatching>,
        @Inject(BxApiService) private readonly bx: BxApiService,
        private readonly errorHandler: ErrorHandler,
        private readonly connection: DataSource,
    ) {}

    /**
     * Initialize matching data:
     * - add missing matches for base fields;
     * - adds default matches if exists.
     * @param auth = authentication data.
     * @see Auth
     * @see Repository
     * @see ApiField
     * @see Matching
     * @see DefaultMatching
     */
    async initiateMatching(auth: Auth): Promise<void> {
        const matching = await this.matchRepository.count({ where: { authId: auth.id } });

        const matches: Matching[] = [];

        const baseFields = await this.connection
            .createQueryBuilder<ApiField>(ApiField, 'field')
            .leftJoinAndMapMany('field.matching', Matching, 'matching', `matching.apiFieldId = field.id and matching.authId = ${auth.id}`)
            .where('field.base = true')
            .getMany();

        baseFields.forEach((f) => {
            if (!f.matching?.length) {
                const match = new Matching();
                match.auth = auth;
                match.apiField = f;
                match.entity = f.default;
                match.code = MatchingService.getIdFiledName(f.default);
                matches.push(match);
            }
        });

        if (matching === 0) {
            const defaultMatches = await this.defaultMatchingRepository.find({ relations: ['apiField'] });
            defaultMatches.forEach((dm) => {
                const match = new Matching();
                match.auth = auth;
                match.apiField = dm.apiField;
                match.entity = dm.entity;
                match.code = dm.code;
                match.valueType = dm.valueType;
                matches.push(match);
            });
        }

        if (matches.length) {
            await this.save(auth, [], matches);
        }
    }

    /**
     * Gets matching for given entity.
     * Processes crm address fields from stored format to original Bitrix24.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @returns FieldDto[] - matching.
     * @see Auth
     * @see FieldDto
     * @see BX_ENTITY
     */
    async getFields(auth: Auth, entity: string): Promise<FieldDto[]> {
        const fields = await this.get(auth, entity);
        fields.forEach((field) => {
            if (field.match?.entity?.includes(BX_ENTITY.ADDRESS)) {
                field.match.entity = field.match.entity.replace('_' + BX_ENTITY.ADDRESS, '');
                if (!field.match.code.includes(BX_ENTITY.ADDRESS)) {
                    field.match.code = BX_ENTITY.ADDRESS + '_' + field.match.code;
                }
                if (field.match.code === 'ADDRESS_1') {
                    field.match.code = 'ADDRESS';
                }
            }
        });
        return fields;
    }

    /**
     * Saves new matching.
     * Processes crm address fields from Bitrix24 original to store format.
     * Generates sets of matches to remove and to add.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param dto - new matching.
     * @see Auth
     * @see MatchDto
     * @see seve
     */
    async saveFields(auth: Auth, entity: string, dto: MatchDto[]): Promise<void> {
        const db = await this.matchRepository.find({
            relations: ['apiField'],
            where: {
                authId: auth.id,
                apiField: {
                    entity,
                },
            },
        });

        const fields = await this.fieldRepository.find({ where: { entity } });
        const dtoMap = keyBy(dto, 'field');

        const matching: Matching[] = [];
        for (const field of fields) {
            if (!dtoMap[field.code]?.entity || (!field.base && !dtoMap[field.code]?.code)) {
                continue;
            }

            if (field.base) {
                if (dtoMap[field.code].entity === BX_ENTITY.SMART_PROCESS) {
                    const base = db.find((f) => f.apiField.base);
                    base.childId = dtoMap[field.code].childId;
                    matching.push(base);
                }
                continue;
            }

            const entity = dtoMap[field.code].entity + (dtoMap[field.code].code.includes('ADDRESS') ? '_ADDRESS' : '');
            let code = dtoMap[field.code].code.replace('ADDRESS_', '');
            if (code === 'ADDRESS') {
                code += '_1';
            }

            const match = new Matching();
            match.auth = auth;
            match.apiField = field;
            match.entity = entity;
            match.code = code;
            match.childType = dtoMap[field.code].childType ?? null;
            match.childId = dtoMap[field.code].childId ?? null;
            match.childCode = dtoMap[field.code].childCode || null;
            match.valueType = dtoMap[field.code].valueType ?? null;
            match.defaultValue = dtoMap[field.code].defaultValue ?? null;
            match.defaultView = dtoMap[field.code].defaultView ?? null;
            match.phoneCodes = dtoMap[field.code].phoneCodes?.toString() || null;
            match.defaultPhoneCode = dtoMap[field.code].defaultPhoneCode ?? null;

            matching.push(match);
        }

        await this.save(
            auth,
            db.filter((f) => !f.apiField.base),
            matching,
        );
    }

    /**
     * Transforms Bitrix24 entities to external API data.
     * Used when data is received from Bitrix24 in advance.
     * Can't transform linked data, use `parseResponse` with manually prepared batch response instead (not recommended)
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param data - Bitrix24 response data.
     * @param unmatchedFields - unmatched fields.
     * @returns external API instance(s).
     * @see Auth
     * @see parseResponse
     */
    async transform<T>(auth: Auth, entity: string, data: any | any[], unmatchedFields: Record<string, string[]> = {}): Promise<T | T[]> {
        let isArray = true;
        if (!Array.isArray(data)) {
            data = [data];
            isArray = false;
        }

        const fields = await this.get(auth, entity);
        if (!fields.length) return isArray ? [] : ({} as T);

        const batchResult = new BxApiResult();
        const key = fields.find((f) => !!f.match).match.entity;
        const result = [];
        for (const item of data) {
            batchResult.result[key] = item;
            result.push(MatchingService.parseResponse(fields, batchResult, unmatchedFields));
        }

        return isArray ? result : result[0];
    }

    /**
     * Save data testing method.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param entityData - data to save.
     * @param callIdField - property name which value acting as call id.
     * @param someFields - field set to save.
     * @returns IBxApiCall[] - batch that will be sent to Bitrix24.
     * @see Auth
     * @see generateRequest
     */
    async saveDataTest(auth: Auth, entity: string, entityData: Record<number | string, any | any[]>, callIdField = '', someFields?: string[]) {
        const fields = (await this.get(auth, entity)).filter((f) => !!f.match?.code);
        if (!fields.length) return [];

        let batch: IBxApiCall[] = [];
        for (const [id, data] of Object.entries(entityData)) {
            batch = batch.concat(
                this.generateSaveRequest(
                    auth,
                    fields.filter((f) => !someFields || someFields.includes(f.code)),
                    data,
                    id,
                    fields.find((f) => f.base),
                    DEFAULT_TIME_ZONE,
                    callIdField,
                ),
            );
        }

        return batch;
    }

    /**
     * Generates Bitrix24 entity from external data as given entity.
     * Loads linked entities.
     * Loads default values.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param baseData - data required to receive base entity from Bitrix24.
     * @param unmatchedFields - unmatched fields.
     * @example
     * unmatchedFields = {
     *    [entity]: ['propertyName'], // unmatched field from base entity
     *    [field.match.code]: ['propertyName'], // unmatched field from linked entity
     * }
     * @returns T - matched external API entity.
     * @throws InternalServerErrorException - if Bitrix24 call failed.
     * @see Auth
     * @see BxApiService
     * @see generateRequest
     * @see parseResponse
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async prepareData<T>(auth: Auth, entity: string, baseData: any, unmatchedFields: Record<string, string[]> = {}): Promise<T> {
        const fields = await this.get(auth, entity);
        if (!fields.length) return {} as T;

        const batch = this.generateRequest(auth, fields, baseData);

        let rawData: BxApiResult<any>;
        try {
            rawData = await this.bx.callBXBatch(auth, batch);
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get data from bitrix', e });
        }

        return MatchingService.parseResponse(fields, rawData, unmatchedFields);
    }

    /**
     * Same as prepareData except doesn't load linked data.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param baseData - data required to receive base entity from Bitrix24.
     * @param unmatchedFields - unmatched fields.
     * @example
     * unmatchedFields = {
     *    [entity]: ['propertyName'], // unmatched field from base entity
     *    [field.match.code]: ['propertyName'], // unmatched field from linked entity
     * }
     * @returns T - matched external API entity.
     * @throws InternalServerErrorException - if Bitrix24 call failed.
     * @throws BadRequestException - if no base match found.
     * @see Auth
     * @see BxApiService
     * @see prepareData
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async prepareList<T>(auth: Auth, entity: string, baseData: any, unmatchedFields: Record<string, string[]> = {}): Promise<T[]> {
        const fields = await this.get(auth, entity);
        if (!fields.length) return [] as T[];

        const base = fields.find((field) => field.base);

        if (!base) {
            this.errorHandler.badRequest(auth, 'No match for base field', 'matching.noBase');
        }

        MatchingService.extendBaseData(baseData, base);

        let rawData;
        try {
            rawData = await this.bx.callBXApi(auth, {
                method: this.listMethod(auth, base.match.entity),
                data: baseData,
            });
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get data from bitrix', e });
        }

        rawData = rawData.data.items ?? rawData.data;
        const result: T[] = [];
        const batchResult = new BxApiResult();
        for (const item of rawData) {
            batchResult.result[base.match.entity] = item;
            result.push(MatchingService.parseResponse(fields, batchResult, unmatchedFields));
        }

        return result;
    }

    async prepareListWithLinkedData<T>(auth: Auth, entity: string, baseData: any, unmatchedFields: Record<string, string[]> = {}): Promise<T[]> {
        const fields = await this.get(auth, entity);
        if (!fields.length) return [] as T[];

        const base = fields.find((field) => field.base);

        if (!base) {
            this.errorHandler.badRequest(auth, 'No match for base field', 'matching.noBase');
        }

        MatchingService.extendBaseData(baseData, base);

        let rawData;
        try {
            rawData = await this.bx.callBXApi(auth, {
                method: this.listMethod(auth, base.match.entity),
                data: baseData,
            });
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get data from bitrix', e });
        }

        rawData = rawData.data.items ?? rawData.data;
        const result: T[] = [];
        for (const item of rawData) {
            const filterData = item.id ? { id: item.id } : { ID: item.ID };
            const preparedData = await this.prepareData<T>(auth, entity, filterData, unmatchedFields);
            result.push(preparedData);
        }

        return result;
    }

    /**
     * Saves external data to Bitrix24. Uses batch calls.
     * Loads linked data identifiers before save.
     * Batch calls disallows to use conditionally data, so default values should be processed in advance
     * or set as unmatchedData.
     * May save different matched entities at once.
     * Gets time zone offset of current user first for correct dates saving.
     * @param auth - authentication data.
     * @param dataSet - data to add/update in Bitrix24.
     * @param callIdField - property name which value acting as call id.
     * @param someFields - fields to add/update (optional), if not provided all matched fields used.
     * @example
     * dataSet = {
     *    [matching entity1]: {
     *       [0]: [data1, data2], // will be added
     *       [id]: data // will be updated
     *    },
     *    [matching entity2]: {
     *       [0]: [data1, data2], // will be added
     *       [id]: data // will be updated
     *    }
     * }
     * @returns BxApiResult - result of batch call.
     * @throws InternalServerErrorException - if Bitrix24 call failed.
     * @see Auth
     * @see BxApiService
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async saveData(
        auth: Auth,
        dataSet: Record<string, Record<number | string, any | any[]>>,
        callIdField = '',
        someFields?: string[],
    ): Promise<BxApiResult<any>> {
        if (!dataSet) return;

        const timeZone = await this.getTimeZone(auth);

        let batch: IBxApiCall[] = [];

        for (const [entity, entityData] of Object.entries(dataSet)) {
            const fields = (await this.get(auth, entity as string)).filter((f) => !!f.match?.code);
            if (!fields.length) continue;

            await this.processEnums(auth, fields, Object.values(entityData));

            for (const [id, data] of Object.entries(entityData)) {
                batch = batch.concat(
                    this.generateSaveRequest(
                        auth,
                        fields.filter((f) => !someFields || someFields.includes(f.code)),
                        data,
                        id,
                        fields.find((f) => f.base),
                        timeZone,
                        callIdField,
                    ),
                );
            }
        }

        try {
            return await this.bx.callBXBatch(auth, batch);
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to update bitrix data', e });
        }
    }

    /**
     * Generates Bitrix24 batch call for saving data:
     * - base entity call;
     * - address calls (if allowed);
     * - linked data to get identifiers.
     * @param auth - authentication data.
     * @param fields - matching.
     * @param data - data to save provided by saveData.
     * @param id - Bitrix24 entity identifier.
     * @param base - base matching, contains match to Bitrix24 identifier property.
     * @param timeZone - time zone for current Bitrix24 user, has default value.
     * @param callIdField - property name which value acting as call id, uuidv4 by default. Should be unique for every base entity.
     * @returns IBxApiCall[] - calls to Bitrix24 API.
     * @see Auth
     * @see FieldDto
     * @see DEFAULT_TIME_ZONE
     * @see saveData
     * @see updateMethod
     * @see generateUpdateData
     * @see pushAddressRequest
     * @see generateChildrenBatch
     * @private
     */
    private generateSaveRequest(
        auth: Auth,
        fields: FieldDto[],
        data: any,
        id: number | string,
        base: FieldDto,
        timeZone = DEFAULT_TIME_ZONE,
        callIdField = '',
    ): IBxApiCall[] {
        if (!Array.isArray(data)) {
            data = [data];
        }

        let batch: IBxApiCall[] = [];

        for (const item of data) {
            const mainCallId = item[callIdField] ?? uuid4();
            batch.push({
                id: mainCallId,
                method: this.updateMethod(auth, base.match.entity, id > 0 ? 'update' : 'add'),
                data: MatchingService.generateUpdateData(base.match.entity, fields, item, id, base, mainCallId, timeZone),
            });
            batch = this.pushAddressRequest(auth, batch, fields, base, item, id && id > 0 ? id : `$result[${mainCallId}]`);
            batch = this.generateChildrenBatch(
                auth,
                fields.filter((f) => !!f.match.childType),
                item,
                mainCallId,
            ).concat(batch);
        }

        return batch;
    }

    /**
     * Pushes to batch add address calls for Bitrix24 contacts and companies.
     * @param auth - authentication data.
     * @param batch - current batch.
     * @param fields - matching.
     * @param base - base matching, contains match to Bitrix24 identifier property.
     * @param data - data to save provided by saveData.
     * @param id - existing Bitrix24 entity identifier or batch result link for added entity.
     * @see Auth
     * @see BX_ENTITY
     * @see IBxApiCall
     * @see FieldDto
     * @see generateSaveRequest
     * @private
     */
    private pushAddressRequest(auth: Auth, batch: IBxApiCall[], fields: FieldDto[], base: FieldDto, data: any, id: number | string) {
        let entity: string;
        switch (base.match.entity) {
            case BX_ENTITY.CONTACT:
                entity = BX_ENTITY.CONTACT_ADDRESS;
                break;
            case BX_ENTITY.COMPANY:
                entity = BX_ENTITY.COMPANY_ADDRESS;
                break;
            default:
                return batch;
        }

        const addressFields = fields.filter((f) => f.match?.entity === entity);
        return addressFields.length ? batch.concat(this.generateSaveRequest(auth, addressFields, data, id, addressFields[0])) : batch;
    }

    /**
     * Generates calls for linked data to extract identifiers before saving.
     * Consider that all fields have childType set.
     * @param auth - authentication data.
     * @param fields - child entities matching.
     * @param item - item to save from dataset.
     * @param mainCallId - identifier of main entity call in batch.
     * @see Auth
     * @see FieldDto
     * @see generateSaveRequest
     * @private
     */
    private generateChildrenBatch(auth: Auth, fields: FieldDto[], item: any, mainCallId): IBxApiCall[] {
        const batch: IBxApiCall[] = [];

        for (const field of fields) {
            const value = getValue(item, (field.propertyPath ?? field.code).split('.'), 0);
            if (value === undefined || value === null || value === '') {
                continue;
            }

            const data = {
                FILTER: {
                    [field.match.childCode]: value,
                },
            };
            MatchingService.extendBaseData(data, field);

            batch.push({
                id: `${mainCallId}_${field.match.code}`,
                method: this.childMethod(auth, field.match.childType),
                data,
            });
        }

        return batch;
    }

    /**
     * Parses Bitrix24 API response to external API entity by matching.
     * Processes:
     * - Bitrix-style booleans to human-style;
     * - enumeration values;
     * - specific data formats (e.g. PHONE, IBLOCK etc);
     * - dates;
     * - linked data;
     * - default values.
     * Sets whole linked entities to `raws` property.
     * Sets whole default entities ro `defaults` property.
     * @param fields - matching.
     * @param data - Bitrix24 API batch response.
     * @param unmatchedFields - unmatched fields.
     * @example
     * unmatchedFields = {
     *    [entity]: ['propertyName'], // unmatched field from base entity
     *    [field.match.code]: ['propertyName'], // unmatched field from linked entity
     * }
     * @returns T - external API entity.
     * @see FieldDto
     * @see BxApiResult
     * @see setValue
     * @see IHasLinkedEntities
     * @private
     */
    private static parseResponse<T>(fields: FieldDto[], data: BxApiResult<any>, unmatchedFields: Record<string, string[]> = {}): T {
        const result = {} as T;

        if (!data?.result) return result;
        for (const field of fields) {
            if (!field.match) {
                setValue(result, (field.propertyPath ?? field.code).split('.'), 0, field.default);
                continue;
            }

            let dataPart = data.result[field.match.childCode ? field.match.code : field.match.entity];
            if (dataPart?.items || dataPart?.item) {
                dataPart = dataPart.items ?? dataPart.item;
            }
            if (Array.isArray(dataPart)) {
                dataPart = field.match.valueType ? dataPart.find((v) => v.TYPE_ID === field.match.valueType) ?? dataPart[0] : dataPart;
            }

            let value;

            if (field.type === BX_FIELD_TYPE.ENUM) {
                const items = data.result[field.match.code]?.fields?.[field.match.code]?.items;
                value = items?.find((item: any) => String(item.ID) === String(dataPart?.[field.match.code]))?.VALUE;
                setValue(result, (field.propertyPath ?? field.code).split('.'), 0, value);
                continue;
            }

            if (field.type === BX_FIELD_TYPE.MONEY) {
                setValue(result, (field.propertyPath ?? field.code).split('.'), 0, parseFloat(value));
                continue;
            }

            if (Array.isArray(dataPart)) {
                value = dataPart.map((d) => {
                    let tmp = d[field.match.childCode ?? field.match.code];
                    if (tmp && typeof tmp === 'object') {
                        tmp = Object.values(tmp)[0];
                    }
                    return tmp;
                });
            } else {
                value = dataPart?.[field.match.childCode ?? field.match.code];
            }

            if (field.match.valueType && Array.isArray(value)) {
                value = value.find((v) => field.match.valueType === v.VALUE_TYPE)?.VALUE ?? field.default;
            } else if (value && typeof value === 'object' && !Array.isArray(value) && field.type !== 'file') {
                value = Object.values(value)[0];
            }

            if (Array.isArray(value) && !field.multiple) {
                value = value[0];
            }

            let defaultValue = data.result[`${field.match.code}_default`];
            if (defaultValue) {
                defaultValue = defaultValue.items ?? defaultValue.item ?? defaultValue;
                const defaultKey = field.linkType ? 'ID' : field.match.childCode ?? field.match.code;
                defaultValue = Array.isArray(defaultValue) ? defaultValue[0]?.[defaultKey] : defaultValue[defaultKey];
            }

            if (value) {
                const types = field.type.split(',');
                if (types.includes('date')) {
                    const date = moment(value);
                    const format = types.includes('datetime') ? undefined : 'YYYY-MM-DD';
                    value = date.isValid() ? date.format(format) : field.default;
                }
            } else {
                value = defaultValue;
            }

            if (field.type.includes('boolean') && (value === 'Y' || value === 'N' || value === '0' || value === '1')) {
                value = value === 'Y' || value === '1';
            }
            setValue(result, (field.propertyPath ?? field.code).split('.'), 0, value);

            if (defaultValue) {
                if (!result['defaults']) {
                    result['defaults'] = {};
                }
                result['defaults'][field.code] = defaultValue;
            }

            if (field.match.childCode) {
                if (!result['raws']) {
                    result['raws'] = {};
                }
                result['raws'][field.code] = dataPart;
            }
        }

        for (const [key, uFields] of Object.entries(unmatchedFields)) {
            for (const field of uFields) {
                const [code, path] = field.split('|');
                result[code] = getValue(data.result[key]?.items ?? data.result[key]?.item ?? data.result[key], (path ?? code).split('.'), 0);
            }
        }

        return result;
    }

    /**
     * Generates batch calls to get data from Bitrix24 API:
     * - base entity call;
     * - linked data calls;
     * - defaulr values calls.
     * @param auth - athentication data.
     * @param fields - matching.
     * @param baseData - data required to receive base entity from Bitrix24.
     * @returns IBxApiCall[] - batch call.
     * @throws BadRequestException - if no base match found.
     * @see Auth
     * @see FieldDto
     * @see IBxApiCall
     * @see getDefaultCall
     * @see linkedCall
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private generateRequest(auth: Auth, fields: FieldDto[], baseData: any): IBxApiCall[] {
        const base = fields.find((field) => !!field.base);

        if (!base) {
            this.errorHandler.badRequest(auth, 'No match for base field', 'matching.noBase');
        }

        MatchingService.extendBaseData(baseData, base);

        const batch = {
            [base.match.entity]: {
                id: base.match.entity,
                method: this.baseMethod(auth, base.match.entity),
                data: baseData,
            } as IBxApiCall,
        };

        for (const field of fields) {
            if (!field.match) continue;

            if (field.match.defaultValue) {
                batch[`${field.match.code}_default`] = this.getDefaultCall(auth, field);
            }

            const batchCode = field.match.childCode || field.type === BX_FIELD_TYPE.ENUM ? field.match.code : field.match.entity;
            if (batch[batchCode]) continue;

            const entity = field.type === BX_FIELD_TYPE.ENUM ? BX_ENTITY.FIELD : field.match.childType ?? field.match.entity;
            batch[batchCode] = this.linkedCall(auth, entity, base.match, field.match);
        }

        return Object.values(batch);
    }

    /**
     * Generates data for saving batch in Bitrix24 API format.
     * Sets links to previous calls as values of linked data.
     * Processes specific data (e.g. PHONE, date, booleans).
     * Extends data by specific values depend on Bitrix24 entity.
     * Adds unmatched data if allowed in 2 ways:
     * - from `unmatchedData` object in `data`;
     * - from properties missing in `fields` if `hasUnmatched` flag provided.
     * @param entity - matching entity.
     * @param fields - matching.
     * @param data - external API data.
     * @param id - Bitrix24 entity identifier (falsy or 0 for adding).
     * @param base - base field matching.
     * @param mainCallId - identifier of main entity call in batch.
     * @param timeZone - current user time zone offset.
     * @returns Record<string,any> - data to save to Bitrix24.
     * @see FieldDto
     * @see wrapValue
     * @see canHaveUnmatched
     * @see processUpdateData
     * @private
     * @static
     */
    private static generateUpdateData(
        entity: string,
        fields: FieldDto[],
        data: any,
        id: number | string,
        base: FieldDto,
        mainCallId: string,
        timeZone: number,
    ): Record<string, any> {
        let result: Record<string, any> = {};
        fields.forEach((field) => {
            if (!field.match?.code || field.match.entity !== base.match.entity) return;
            const value = getValue(data, (field.propertyPath ?? field.code).split('.'), 0);
            if (value === undefined && field.match.defaultValue === null) return;

            if (field.match.childType) {
                result[field.match.code] =
                    value === undefined || value === null || value === ''
                        ? field.match.defaultValue
                        : `$result[${mainCallId}_${field.match.code}]` +
                          `${MatchingService.getResultPathPart(field.match.childType, '[items]')}[0]` +
                          `[${MatchingService.getIdFiledName(field.match.childType)}]`;
            } else {
                result[field.match.code] = MatchingService.wrapValue(result[field.match.code], value ?? field.match.defaultValue, field, timeZone);
            }
        });

        if (MatchingService.canHaveUnmatched(entity)) {
            if (typeof data.unmatchedData === 'object') {
                result = { ...result, ...data.unmatchedData };
            }
            if (data.hasUnmatched) {
                const matched = fields.map((f) => f.code);
                Object.keys(data)
                    .filter((key) => key !== 'hasUnmatched' && !matched.includes(key) && typeof data[key] !== 'object')
                    .forEach((key) => {
                        result[key] = data[key];
                    });
            }
        }

        return MatchingService.processUpdateData(result, entity, id, base);
    }

    /**
     * Checks currentValue and the field settings to allow values to be concatenated.
     * @param currentValue - current value of specific data.
     * @param field - field with match.
     * @returns true if field can be concat
     * @see FieldDto
     */
    private static checkIfFieldCanBeConcat(currentValue: any, field: FieldDto) {
        if (typeof currentValue !== 'string' || !currentValue?.length) {
            return false;
        }
        if (field.multiple) {
            return false;
        }
        if (field.type !== BX_FIELD_TYPE.STRING) {
            return false;
        }
        if (field.propertyPath?.includes('[]')) {
            return false;
        }
        switch (field.match?.code) {
            case TypedValues.PHONE:
            case TypedValues.EMAIL:
            case TypedValues.WEB:
                return false;
        }
        return true;
    }

    /**
     * Extends data to save by specific values depend on Bitrix24 entity.
     * @param data - data to save.
     * @param entity - Bitrix24 API Entity.
     * @param id - Bitrix24 API entity identifier (falsy or 0 for adding).
     * @param base - base field matching.
     * @returns Record<string,any> - data to save to Bitrix24.
     * @see FieldDto
     * @see BX_ENTITY
     * @see generateUpdateData
     * @private
     * @static
     */
    private static processUpdateData(data: any, entity: string, id: number | string, base: FieldDto): Record<string, any> {
        switch (entity) {
            case BX_ENTITY.CONTACT:
                return {
                    id,
                    fields: data,
                };
            case BX_ENTITY.CONTACT_ADDRESS:
            case BX_ENTITY.COMPANY_ADDRESS:
                return {
                    fields: {
                        TYPE_ID: base.match.valueType,
                        ENTITY_TYPE_ID: BX_ENTITY.ENTITY_TYPE_ID(entity),
                        ENTITY_ID: id,
                        ...data,
                    },
                };
            case BX_ENTITY.USER:
                return {
                    ID: id > 0 ? id : undefined,
                    ...data,
                };
            case BX_ENTITY.SMART_PROCESS:
                return {
                    id,
                    entityTypeId: base.match.childId,
                    fields: data,
                };
        }

        return data;
    }

    /**
     * Generates Bitrix24 API call get method.
     * @param auth - authentication data.
     * @param entity - Bitrix24 API entity.
     * @returns string - Bitrix24 API call method.
     * @throws BadRequestException if unknown base entity provided.
     * @see Auth
     * @see BX_ENTITY
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private baseMethod(auth: Auth, entity: string): string {
        switch (entity) {
            case BX_ENTITY.CONTACT:
                return 'crm.contact.get';
            case BX_ENTITY.COMPANY:
                return 'crm.company.get';
            case BX_ENTITY.USER:
                return 'user.get';
            case BX_ENTITY.SMART_PROCESS:
                return 'crm.item.get';
            case BX_ENTITY.LIST:
                return 'lists.element.get';
            default:
                this.errorHandler.badRequest(auth, `Unknown base entity [${entity}]`, 'matching.unknownBase');
        }
    }

    /**
     * Generates Bitrix24 API call list method for linked entity in add or update batch.
     * @param auth - authentication data.
     * @param entity - Bitrix24 API entity.
     * @throws BadRequestException if unknown base entity provided.
     * @see Auth
     * @see BX_ENTITY
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private childMethod(auth: Auth, entity: string) {
        switch (entity) {
            case BX_ENTITY.CONTACT:
                return 'crm.contact.list';
            case BX_ENTITY.COMPANY:
                return 'crm.company.list';
            case BX_ENTITY.USER:
                return 'user.get';
            case BX_ENTITY.SMART_PROCESS:
                return 'crm.item.list';
            case BX_ENTITY.LIST:
                return 'lists.element.get';
            case BX_ENTITY.CRM_STATUS:
                return 'crm.status.get';
            default:
                this.errorHandler.badRequest(auth, `Unknown base entity [${entity}]`, 'matching.unknownBase');
        }
    }

    /**
     * Generates Bitrix24 API call list method.
     * @param auth - authentication data.
     * @param entity - Bitrix24 API entity.
     * @returns string - Bitrix24 API call method.
     * @throws BadRequestException if unknown base entity provided.
     * @see Auth
     * @see BX_ENTITY
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private listMethod(auth: Auth, entity: string): string {
        switch (entity) {
            case BX_ENTITY.CONTACT:
                return 'crm.contact.list';
            case BX_ENTITY.COMPANY:
                return 'crm.company.list';
            case BX_ENTITY.USER:
                return 'user.get';
            case BX_ENTITY.SMART_PROCESS:
                return 'crm.item.list';
            case BX_ENTITY.LIST:
                return 'lists.element.list';
            default:
                this.errorHandler.badRequest(auth, `Unknown base entity [${entity}]`, 'matching.unknownBase');
        }
    }

    /**
     * Generates Bitrix24 API call for linked entity.
     * @param auth - authentication data.
     * @param entity - Bitrix24 API entity.
     * @param base - base field match.
     * @param match - linked match.
     * @returns IBxApiCall - Bitrix24 API call.
     * @throws BadRequestException if unknown linked entity provided.
     * @see Auth
     * @see MatchDto
     * @see BX_ENTITY
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private linkedCall(auth: Auth, entity: string, base: MatchDto, match: MatchDto): IBxApiCall {
        switch (entity) {
            case BX_ENTITY.CONTACT: {
                return {
                    id: entity,
                    method: 'crm.contact.get',
                    data: {id: `$result[${base.entity}][CONTACT_ID]`}
                }
            }
            case BX_ENTITY.CONTACT_ADDRESS:
            case BX_ENTITY.COMPANY_ADDRESS:
                return {
                    id: entity,
                    method: 'crm.address.list',
                    data: {
                        filter: {
                            ANCHOR_ID: `$result[${base.entity}][ID]`,
                            ANCHOR_TYPE_ID: BX_ENTITY.ENTITY_TYPE_ID(entity),
                        },
                    },
                };
            case BX_ENTITY.COMPANY:
                return {
                    id: BX_ENTITY.COMPANY,
                    method: 'crm.company.get',
                    data: { id: `$result[${base.entity}][COMPANY_ID]` },
                };
            case BX_ENTITY.LIST:
                return {
                    id: match.code,
                    method: 'lists.element.get',
                    data: {
                        IBLOCK_TYPE_ID: 'lists',
                        IBLOCK_ID: match.childId,
                        ELEMENT_ID: `$result[${match.entity}]${MatchingService.getResultPathPart(match.entity)}[${match.code}]`,
                    },
                };
            case BX_ENTITY.SMART_PROCESS:
                return {
                    id: match.code,
                    method: 'crm.item.list',
                    data: {
                        entityTypeId: match.childId,
                        filter: {
                            id: `$result[${base.entity}]${MatchingService.getResultPathPart(base.entity)}[${match.code}]`,
                        },
                    },
                };
            case BX_ENTITY.CRM_STATUS:
                return {
                    id: match.code,
                    method: 'crm.status.list',
                    data: {
                        filter: {
                            ENTITY_ID: match.childId,
                            STATUS_ID: `$result[${base.entity}]${MatchingService.getResultPathPart(base.entity)}[${match.code}]`,
                        },
                    },
                };
            case BX_ENTITY.FIELD:
                return {
                    id: match.code,
                    method: `crm.${MatchingService.getCRMEntity(match.entity)}.fields`,
                    data: {
                        entityTypeId: base.childId,
                    },
                };
            default:
                this.errorHandler.badRequest(auth, `Unknown linked entity [${entity}]`, 'matching.unknownLinkedEntity');
        }
    }

    /**
     * Generates Bitrix24 API call add or update method.
     * @param auth - authentication data.
     * @param entity - Bitrix24 entity.
     * @param method - add or update.
     * @returns string - Bitrix24 API call method.
     * @throws BadRequestException if unknown base entity provided.
     * @see Auth
     * @see BX_ENTITY
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private updateMethod(auth: Auth, entity: string, method: 'add' | 'update' = 'update'): string {
        switch (entity) {
            case BX_ENTITY.CONTACT:
                return `crm.contact.${method}`;
            case BX_ENTITY.COMPANY:
                return `crm.company.${method}`;
            case BX_ENTITY.CONTACT_ADDRESS:
            case BX_ENTITY.COMPANY_ADDRESS:
                return `crm.address.add`;
            case BX_ENTITY.USER:
                return `user.${method}`;
            case BX_ENTITY.SMART_PROCESS:
                return `crm.item.${method}`;
            default:
                this.errorHandler.badRequest(auth, 'Unknown base entity', 'matching.unknownBase');
        }
    }

    /**
     * Adds specific data for Bitrix24 API call.
     * @param baseData - original request data.
     * @param base - matching base field.
     * @see FieldDto
     * @see BX_ENTITY
     * @private
     * @static
     */
    private static extendBaseData(baseData: any, base: FieldDto): void {
        switch (base.match.childType ?? base.match.entity) {
            case BX_ENTITY.SMART_PROCESS:
                baseData.entityTypeId = base.match.childId;
                break;
            case BX_ENTITY.LIST:
                baseData.IBLOCK_TYPE_ID = 'lists';
                baseData.IBLOCK_ID = base.match.childId;
        }
    }

    /**
     * Gets matching from database.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @returns FieldDto[] - matching.
     * @see Auth
     * @see FieldDto
     */
    async get(auth: Auth, entity: string): Promise<FieldDto[]> {
        return (
            await this.connection
                .createQueryBuilder<ApiField>(ApiField, 'field')
                .leftJoinAndMapMany('field.matching', Matching, 'matching', `matching.apiFieldId = field.id and matching.authId = ${auth.id}`)
                .where('field.entity = :entity', { entity })
                .orderBy('field.base', 'DESC')
                .addOrderBy('field.sort', 'ASC')
                .getMany()
        ).map((f) => new FieldDto(f));
    }

    /**
     * Saves new matching.
     * @param auth - authentication data.
     * @param toRemove - matches to remove.
     * @param toAdd - matches to add.
     * @throws InternalServerErrorException if save to DB failed.
     * @see Auth
     * @see Matching
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async save(auth: Auth, toRemove: Matching[], toAdd: Matching[]): Promise<void> {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.remove(toRemove);
            await queryRunner.manager.save(toAdd);

            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
            this.errorHandler.internal({ auth, message: 'Failed to save matches', e });
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Generates Bitrix24 API call for default values.
     * @param auth - authentication data.
     * @param field - matching field.
     * @returns IBxApiCall - Bitrix24 API call.
     * @throws BadRequestException if default values not allowed for given Bitrix24 entity.
     * @see Auth
     * @see BX_ENTITY
     * @see FieldDto
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private getDefaultCall(auth: Auth, field: FieldDto): IBxApiCall {
        switch (field.linkType ?? field.match?.childType ?? field.match?.entity) {
            case BX_ENTITY.USER: {
                return {
                    id: `${field.match.code}_default`,
                    method: 'user.get',
                    data: { ID: field.match.defaultValue },
                };
            }
            case BX_ENTITY.COMPANY: {
                return {
                    id: `${field.match.code}_default`,
                    method: 'crm.company.get',
                    data: { id: field.match.defaultValue },
                };
            }
            case BX_ENTITY.LIST: {
                return {
                    id: `${field.match.code}_default`,
                    method: 'lists.element.get',
                    data: {
                        IBLOCK_TYPE_ID: 'lists',
                        IBLOCK_ID: field.match.childId,
                        ELEMENT_ID: field.match.defaultValue,
                    },
                };
            }
            case BX_ENTITY.CRM_STATUS:
                return {
                    id: `${field.match.code}_default`,
                    method: 'crm.status.get',
                    data: {
                        id: field.match.defaultValue,
                    },
                };
            case BX_ENTITY.BLOCK_SECTION:
                return {
                    id: `${field.match.code}_default`,
                    method: 'lists.section.get',
                    data: {
                        IBLOCK_TYPE_ID: 'lists',
                        IBLOCK_ID: field.match.childId,
                        ELEMENT_ID: field.match.defaultValue,
                    },
                };
            case BX_ENTITY.CRM_CATEGORY:
                return {
                    id: `${field.match.code}_default`,
                    method: 'crm.category.list',
                    data: {
                        entityTypeId: field.match.childId,
                    },
                };
            default:
                this.errorHandler.badRequest(
                    auth,
                    `Unknown default entity [${field.linkType ?? field.match?.childType ?? field.match?.entity}]`,
                    'matching.unknownDefaultEntity',
                );
        }
    }

    /**
     * Processes external API data to specific Bitrix24 API format:
     * - booleans to 'Y'/'N';
     * - contacts to typed values;
     * - dates time zones to current user time zone;
     * - adds phone country codes if set.
     * @param currentValue - current value of specific data
     * (e.g. PHONE is array of typed values we should push `newValue` to instead of replace).
     * @param newValue - external API value.
     * @param field - field with match.
     * @param timeZone - current Bitrix24 API user time zone offset.
     * @see FieldDto
     * @see TypedValues
     * @private
     * @static
     */
    private static wrapValue(currentValue: any, newValue: any, field: FieldDto, timeZone: number) {
        if (typeof newValue === 'boolean') {
            return newValue ? 'Y' : 'N';
        }

        if (field.type.includes('boolean')) {
            if (newValue === 'true') return 'Y';
            if (newValue === 'false') return 'N';
        }

        if (field.type.includes('date')) {
            // Bitrix24 API acts strange with time zone offsets...
            // We should convert dates to current portal time zone manually  and send without offset.
            // Anyway, it will work wrong if current user (which provides authorization for Bitrix24 API requests)
            // has time zone different from default Bitrix24 portal offset.
            const tmp = moment(newValue);
            if (tmp.isValid()) {
                const format = field.type.includes('datetime') ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD';
                return tmp.utcOffset(timeZone).format(format);
            } else {
                return null;
            }
        }

        if (MatchingService.checkIfFieldCanBeConcat(currentValue, field)) {
            if (!newValue?.length) {
                return currentValue;
            }
            return `${currentValue}, ${newValue}`;
        }

        if (!field.match?.valueType) return newValue;
        if (!newValue) return currentValue ?? [];

        switch (field.match?.code) {
            case TypedValues.PHONE:
                newValue = newValue.replace(/\s|^0+/g, '');
                const valueWithPlus = newValue[0] === '+' ? newValue : `+${newValue}`;
                let isValueWithCode = false;
                for (const code of field.match.phoneCodes ?? []) {
                    if (valueWithPlus.startsWith(code)) {
                        isValueWithCode = true;
                        newValue = valueWithPlus;
                        break;
                    }
                }
                if (!isValueWithCode) {
                    newValue = field.match.defaultPhoneCode ? field.match.defaultPhoneCode + newValue.replace('+', '') : valueWithPlus;
                }
            /*falls through*/
            case TypedValues.EMAIL:
            case TypedValues.WEB:
                return (currentValue ?? []).concat([{ VALUE: newValue, VALUE_TYPE: field.match.valueType }]);
            default:
                return newValue;
        }
    }

    /**
     * Bitrix24 developers could not choose exactly one format for response data, so we are who suffer...
     * @param entity - Bitrix24 entity.
     * @param part - Bitrix24 api response extended part.
     * @return string - extended path to data of interest in Bitrix24 response.
     * @see BX_ENTITY
     * @private
     * @static
     */
    private static getResultPathPart(entity: string, part = '[item]'): string {
        switch (entity) {
            case BX_ENTITY.SMART_PROCESS:
                return part;
            default:
                return '';
        }
    }

    /**
     * Bitrix24 developers could not choose exactly one format for response data, so we are who suffer...
     * @param entity - Bitrix24 entity.
     * @returns 'id'|'ID' - identifier property name.
     * @see BX_ENTITY
     * @private
     * @static
     */
    private static getIdFiledName(entity: string): 'id' | 'ID' {
        return entity === BX_ENTITY.SMART_PROCESS ? 'id' : 'ID';
    }

    /**
     * Transforms from external API entity to Bitrix24 entity.
     * Used for quick transformation as follows:
     * @example
     * `Customer: { username } => BxUser: { LOGIN }`
     * ATTENTION:
     * - ignores linked entities;
     * - ignores default values.
     * @param auth - authentication data.
     * @param data - external api data.
     * @param entity - matching entity.
     * @returns T data matched to Bitrix24 entity.
     * @see Auth
     */
    async matchData<T>(auth: Auth, data: any, entity: string): Promise<T> {
        if (!data) return data;

        const matchedData: any = {};
        const fieldMap = keyBy(await this.get(auth, entity), 'code');
        Object.keys(data).forEach((key) => {
            if (fieldMap[key]?.match?.code) {
                matchedData[fieldMap[key].match.code] = data[key];
            }
        });

        return matchedData;
    }

    /**
     * Looks for Bitrix24 entity property name matched with external API property.
     * Loads matching by given entity first.
     * @param auth - authentication data.
     * @param entity - matching entity
     * @param fieldName - external API property name.
     * @returns string - property name.
     * @see Auth
     */
    async getMatch<T>(auth: Auth, entity: string, fieldName: keyof T): Promise<string> {
        return MatchingService.getMatch(await this.get(auth, entity), fieldName);
    }

    /**
     * Looks for Bitrix24 entity property name matched with external API property.
     * Do the same as non static method except matching is preloaded.
     * @param fields - matching.
     * @param fieldName - external API property name.
     * @returns string - property name.
     * @see FieldDto
     * @static
     */
    static getMatch<T>(fields: FieldDto[], fieldName: keyof T): string {
        return fields.find((f) => f.code === fieldName)?.match?.code;
    }

    /**
     * Adds data to dataset to save into Bitrix24.
     * @param data - current dataset.
     * @param entity - matching entity.
     * @param item - external api entity instance.
     * @param bxMap - existing in Bitrix24 matched entities map.
     * @param key - Bitrix24 entity property name acting as key of bxMap.
     * @param idField -Bitrix24 entity identifier property name.
     * @static
     */
    static pushDataToDataset<T>(data: any, entity: string, item: T, bxMap: any, key: string, idField: 'ID' | 'id' = 'ID'): void {
        if (!data[entity]) {
            data[entity] = {};
        }

        if (bxMap[key]?.[idField]) {
            data[entity][bxMap[key][idField]] = item;
        } else {
            if (!Array.isArray(data[entity][0])) {
                data[entity][0] = [];
            }
            data[entity][0].push(item);
        }
    }

    /**
     * Gets matches between Bitrix24 and external API values.
     * @example
     * One needs to request for smart process elements in `CREATED` or `UPDATED` status.
     * `status` is iblock list.
     * In that case method will return object: `{ CREATED: bxCreated, UPDATED: bxUpdated }`.
     * Then one can use received match in filter: `filter: { [bxFiledName]: [result['CREATED'], result['UPDATED']]}.
     * @param auth - authetication data.
     * @param fields - matching.
     * @param fieldName - external api field name.
     * @returns Record<string,string> - API value - Bitrix24 value matches.
     * @see Auth
     * @see FieldDto
     */
    async getListValues(auth: Auth, fields: FieldDto[], fieldName: string): Promise<Record<string, string>> {
        const match = fields.find((f) => f.code === fieldName)?.match;
        if (!match?.childId) return {};

        const result: Record<string, string> = {};
        let items: any = [];

        switch (match.childType) {
            case BX_ENTITY.LIST:
                items = await this.bx.getList(auth, {
                    method: 'lists.element.get',
                    data: {
                        IBLOCK_TYPE_ID: 'lists',
                        IBLOCK_ID: match.childId,
                    },
                });
                break;
            default:
                this.logger.error({ auth, message: `Unsupported child entity for list values [${match.childType}]` });
                return {};
        }

        if (items.error) {
            this.logger.error({ auth, message: `Failed to get child list values :${items.error}` });
            return {};
        }

        items.data.forEach((item) => {
            let value = item[match.childCode];

            if (!value) return;

            if (typeof value === 'object') {
                value = Object.values(value)[0];
            }
            result[value] = item[MatchingService.getIdFiledName(match.childType)];
        });

        return result;
    }

    /**
     * Checks whether Bitrix24 entity can have any unmatched data.
     * @param entity - Bitrix24 entity.
     * @returns boolean - whether unmatched data allowed.
     * @private
     * @static
     */
    private static canHaveUnmatched(entity: string): boolean {
        switch (entity) {
            case BX_ENTITY.CONTACT_ADDRESS:
            case BX_ENTITY.COMPANY_ADDRESS:
            case BX_ENTITY.CRM_STATUS:
                return false;
            default:
                return true;
        }
    }

    /**
     * Gets enum from Bitrix24.
     * @param auth - authentication data.
     * @param field - field with match.
     * @param additionalData - additional request data, eg entityTypeId for smart processes.
     * @returns Record<number,string> - Bitrix24 { ID: 'VALUE' } enumeration.
     * @throws InternalServerErrorException
     * @see Auth
     * @see FieldDto
     * @see BxApiService
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async getEnum(auth: Auth, field: FieldDto, additionalData?: Record<string, any>): Promise<Record<number, string>> {
        if (!field?.match || field.type !== BX_FIELD_TYPE.ENUM) return {};

        const bxEnum: Record<number, string> = {};

        let result;
        try {
            result = await this.bx.callBXApi(auth, {
                method: `crm.${MatchingService.getCRMEntity(field.match.entity)}.fields`,
                data: additionalData,
            });
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get fields from bitrix', e });
        }

        const items = result.data?.fields?.[field.match.code]?.items ?? [];
        for (const item of items) {
            bxEnum[item.ID] = item.VALUE;
        }

        return bxEnum;
    }

    /**
     * Preprocesses enum fields if any exists in matching.
     * It's not possible to use enum values in batch requests,
     * so we should transform enum VALUE to ID manually before batch call.
     * @param auth - authentication data.
     * @param fields - entity fields.
     * @param data - entity data values.
     * @throws InternalServerErrorException
     * @see Auth
     * @see FieldDto
     * @see BxApiService
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async processEnums(auth: Auth, fields: FieldDto[], data: any[]): Promise<void> {
        const enumFields = fields.filter((f) => f.type === BX_FIELD_TYPE.ENUM);
        if (!enumFields.length) return;

        const base = fields.find((f) => f.base);
        const batch: IBxApiCall[] = [];
        for (const field of enumFields) {
            batch.push(this.linkedCall(auth, BX_ENTITY.FIELD, base.match, field.match));
        }

        let fieldData;
        try {
            fieldData = await this.bx.callBXBatch(auth, batch);
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get fields from bitrix', e });
        }

        for (const field of enumFields) {
            for (const item of data) {
                [].concat(item).forEach((i) => {
                    const values = fieldData.result[field.match.code]?.fields?.[field.match.code]?.items;
                    i[field.code] = values?.find((item: any) => String(item.VALUE) === String(i[field.code]))?.ID;
                });
            }
        }
    }

    /**
     * Checks whether one entity is parent for another.
     * Require base fields with matches.
     * Considers that all base fields should have matches if application is installed properly.
     * @param auth - authentication data.
     * @param parentBase - parent base field.
     * @param childBase - child base field.
     * @returns boolean - whether parent is actually parent.
     * @throws InternalServerErrorException
     * @see Auth
     * @see FieldDto
     * @see BxApiService
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async checkParent(auth: Auth, parentBase: FieldDto, childBase: FieldDto): Promise<boolean> {
        if (!parentBase.base || !childBase.base) {
            return false;
        }

        let result;
        try {
            result = await this.bx.callBXApi(auth, {
                method: `crm.${MatchingService.getCRMEntity(childBase.match.entity)}.fields`,
                data: {
                    entityTypeId: childBase.match.childId,
                },
            });
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get fields from bitrix', e });
        }

        return !!result.data?.fields?.[MatchingService.getParentField(parentBase)];
    }

    /**
     * Match service entity with Bitrix24 entity.
     * By default returns given entity if no other match found.
     * @param entity - matched entity.
     * @returns string - Bitrix24 CRM entity code.
     * @private
     * @static
     */
    private static getCRMEntity(entity: string): string {
        switch (entity) {
            case BX_ENTITY.SMART_PROCESS:
                return 'item';
            case BX_ENTITY.CONTACT:
                return 'contact';
            case BX_ENTITY.COMPANY:
                return 'company';
            default:
                return entity;
        }
    }

    /**
     * Gets property name acting as parent for smart process by parent entity.
     * @param parent - parent field with match.
     * @returns string - parent property name.
     * @see FieldDto
     * @private
     * @static
     */
    private static getParentField(parent: FieldDto): string {
        switch (parent?.match?.entity) {
            case BX_ENTITY.CONTACT:
                return 'contactId';
            case BX_ENTITY.COMPANY:
                return 'companyId';
            case BX_ENTITY.SMART_PROCESS:
                return `parentId${parent.match.childId}`;
            default:
                return null;
        }
    }

    /**
     * Gets time zone offset of current Bitrix24 authorized user.
     * If failed returns default offset (MSK +3)
     * @param auth - authentication data.
     * @returns number - offset in hours.
     * @see DEFAULT_TIME_ZONE
     * @see Auth
     * @see BxApiService
     * @private
     */
    private async getTimeZone(auth: Auth): Promise<number> {
        try {
            const result = await this.bx.callBXApi<any>(auth, { method: 'profile', data: {} });
            return result.data?.TIME_ZONE_OFFSET ? Number(result.data.TIME_ZONE_OFFSET) / 3600 : DEFAULT_TIME_ZONE;
        } catch (e) {
            this.logger.error({ domain: auth.domain, member_id: auth.member_id, err: e });
            return DEFAULT_TIME_ZONE;
        }
    }
}
