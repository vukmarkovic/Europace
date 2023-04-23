import { Injectable, Logger } from '@nestjs/common';
import MatchingService from '../../matching/matching.service';
import MatchingEntityEnum from '../../../common/enums/matching.entity.enum';
import { Auth } from '../../../common/modules/auth/model/entities/auth.entity';
import { IEntityMatch } from '../models/interfaces/entity.match';
import FieldDto from '../../matching/models/dto/field.dto';
import MatchException from '../../../modules/matching/models/exceptions/match.exception';
import { IApiResponseFields } from '../../matching/models/interfaces/api.response.fields';
import { IEuropaceCredentialsMatching } from '../../europace/models/interfaces/matching/europace.credentials.matching';
import { ErrorHandler } from '../../../common/modules/errorhandler/error.handler.service';
import { BxApiService } from '../../bxapi/bx.api.service';
import EuropaceService from '../../../modules/europace/europace.service';
import { IEuropaceTokenResponse } from '../../europace/models/interfaces/europace.token.response';

/**
 * Provides common functions for all tasks.
 *
 * Uses:
 * - matching interface
 */
@Injectable()
export default class TaskHelper {
    private readonly logger = new Logger(TaskHelper.name);
    constructor(
        private readonly matching: MatchingService,
        private readonly errorHandler: ErrorHandler,
        private readonly bx: BxApiService,
        private readonly europaceService: EuropaceService,
    ) {}

    /**
     * Gets matching:
     * - fields set for entity
     * - idField
     * - entityTypeId (optional, available for BX_ENTITY.SMART_PROCESS only)
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param idFieldName - name of property acting as identifier.
     * @param checkEntityTypeId - check whether entityTypeId is set for entity.
     * @returns IEntityMatch
     * @throws MatchException if no match for idField or no entityTypeId set and entityTypeId check required.
     * @see Auth
     * @see MatchingService
     * @see MatchingEntityEnum
     * @see BX_ENTITY
     */
    async getMatch<T>(auth: Auth, entity: MatchingEntityEnum, idFieldName: keyof T, checkEntityTypeId = false): Promise<IEntityMatch> {
        const fields = await this.matching.get(auth, entity);
        const idField = MatchingService.getMatch<T>(fields, idFieldName);
        const entityTypeId = fields.find((f) => f.base)?.match?.childId;

        if (!idField) {
            throw new MatchException(`No [${String(idFieldName)}] matching for [${entity}]`);
        }
        if (checkEntityTypeId && !entityTypeId) {
            throw new MatchException(`No entityTypeId for [${entity}]`);
        }

        return {
            fields,
            idField,
            entityTypeId,
        };
    }

    /**
     * Checks whether matched entity has field to link with matched parent.
     * Expects that initial matching added base matching while app installation.
     * @param auth - authentication data.
     * @param parentFields - parent entity fields with matches.
     * @param childFields - child entity fields with matches.
     * @throws MatchException if link with parent missed.
     * @see Auth
     * @see FieldDto
     * @see MatchingService
     */
    async checkParent(auth: Auth, parentFields: FieldDto[], childFields: FieldDto[]): Promise<void> {
        const parentBase = parentFields.find((f) => f.base);
        const childBase = childFields.find((f) => f.base);
        if (!(await this.matching.checkParent(auth, parentBase, childBase))) {
            throw new MatchException(`Incorrect matching: [${parentBase.code}] is not parent of [${childBase.code}]`);
        }
    }

    /**
     * Checks item list length.
     * If list is empty and preloaded item exists, saves not found error to Bitrix24 entity.
     * @param auth - authentication data.
     * @param list - item list.
     * @param item - preloaded item (may be undefined).
     * @param entity - matching entity, also matching entity acting as base field name containng Bitrix24 identifier.
     * @returns boolean - whether list is empty.
     * @see Auth
     * @see MatchingEntityEnum
     * @see saveError
     */
    async saveNotFoundError<T extends IApiResponseFields>(auth: Auth, list: any[], item: T, entity: MatchingEntityEnum): Promise<boolean> {
        if (!list.length && !!item) {
            await this.saveError(auth, entity, item[entity], 'Item not found in API', 404);
        }

        return !list.length;
    }

    /**
     * Saves error to service fields of Bitrix24 entity.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param id - Bitrix24 entity identifier.
     * @param message - error message.
     * @param code - error code.
     * @see Auth
     * @see MatchingEntityEnum
     * @see MatchingService
     */
    async saveError(auth: Auth, entity: MatchingEntityEnum, id: string | number, message, code): Promise<void> {
        await this.matching.saveData(
            auth,
            {
                [entity]: {
                    [id]: {
                        LastAPIResponseCode: code,
                        LastAPIResponseMessage: message,
                    },
                },
            },
            null,
            ['LastAPIResponseCode', 'LastAPIResponseMessage'],
        );
    }

    /**
     * Get auth token from Europace API by user id. Saves result into Bitrix credentials smart process.
     * 
     * @param auth - authentication data.
     * @param userId - Bitrix user id.
     * @param useSubject - use subject param for token request
     * @returns Token Data
     */
    async getEuropaceToken(auth: Auth, userId: number, useSubject = false): Promise<[IEuropaceTokenResponse, string]> {
        if (!userId || userId < 1) {
            this.errorHandler.badRequest(auth, `Lead assignedById is empty`);
        }

        const {
            idField: serviceField,
            entityTypeId: credentialsEntityTypeId,
            fields: credentialsFields,
        } = await this.getMatch(auth, MatchingEntityEnum.CREDENTIALS, 'service');

        const serviceId = credentialsFields.find((f) => f.code === 'service')?.match?.defaultValue;

        if (!serviceId) {
            this.errorHandler.badRequest(auth, `Credentials serviceId is empty`);
        }

        const datashow = {data: {
            filter: {
                [`=assignedById`]: userId,
                [`=${serviceField}`]: serviceId,
            },
            entityTypeId: credentialsEntityTypeId,
        }};
        this.logger.log({
            domain: auth.domain,
            message: 'Credentials get filter: ' + datashow.toString(),
        });

        const credentialsList = (
            await this.bx.getList<{ id: number }>(auth, {
                method: 'crm.item.list',
                data: {
                    filter: {
                        [`=assignedById`]: [userId],
                        [`=${serviceField}`]: [serviceId],
                    },
                    entityTypeId: credentialsEntityTypeId,
                },
            })
        ).data;

        if (credentialsList.length < 1) {
            this.errorHandler.badRequest(auth, `Credentials not found`);
        }

        const credentials = await this.matching.prepareData<IEuropaceCredentialsMatching>(auth, MatchingEntityEnum.CREDENTIALS, { id: credentialsList[0].id });

        if (!credentials) {
            this.errorHandler.notFound(auth, `User credentials not found in SP Credentials`, 'credentials.notFound');
        }

        const tokenData = await this.europaceService.getToken(auth, credentials.url, credentials.username, credentials.password,
           useSubject ? credentials.partnerId : undefined);
        const tokenUpdateData = {
            token_type: '',
            LastAPIResponseCode: 200,
            LastAPIResponseMessage: JSON.stringify(tokenData),
            unmatchedData: { [credentialsFields.find(x => x.code === 'access_token')?.match?.childCode]: tokenData.access_token }
        };

        await this.matching.saveData(
            auth,
            {
                [MatchingEntityEnum.CREDENTIALS]: {
                    [credentials.CREDENTIALS]: tokenUpdateData,
                },
            },
            null,
            Object.keys(tokenUpdateData),
        );
        return [tokenData, credentials.partnerId];
    }
}
