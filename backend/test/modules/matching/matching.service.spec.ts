import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import ApiField from '../../../src/modules/matching/models/entities/api.field.entity';
import BX_ENTITY from '../../../src/modules/bxapi/models/constants/bx.entity';
import DefaultMatching from '../../../src/modules/matching/models/entities/default.matching';
import BxApiResult from '../../../src/modules/bxapi/models/bx.api.result';
import TypedValues from '../../../src/modules/matching/models/enums/typed.values';
import MatchDto from '../../../src/modules/matching/models/dto/match.dto';
import FieldDto from '../../../src/modules/matching/models/dto/field.dto';
import MatchingService from '../../../src/modules/matching/matching.service';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import IBxApiCall from '../../../src/modules/bxapi/models/intefaces/bx.api.call';
import Matching from '../../../src/modules/matching/models/entities/matching.entity';
import moment = require("moment");

jest.mock('@nestjs/common/services/logger.service');
moment.suppressDeprecationWarnings = true;
const authMock = {
    domain: 'domain.test',
    member_id: 'member_id',
} as Auth;
const mockedApiFieldRepo = {
    find() {
        return [
            {
                code: 'base',
                base: true,
                type: 'string',
            },
            {
                code: 'field1',
                base: false,
                type: 'string',
            },
            {
                code: 'field2',
                base: false,
                type: 'string',
            },
            {
                code: 'field3',
                base: false,
                type: 'string',
            },
            {
                code: 'field4',
                base: false,
                type: 'string',
            },
            {
                code: 'field5',
                base: false,
                type: 'string',
            },
        ];
    },
};
const mockedMatchingRepo = {
    find(): Matching[] {
        return [
            {
                id: 1,
                entity: BX_ENTITY.SMART_PROCESS,
                code: 'base',
                apiField: { base: true } as ApiField,
                authId: 1,
                phoneCodes: null,
                defaultPhoneCode: null,
                auth: null,
            },
            {
                id: 2,
                entity: BX_ENTITY.CONTACT,
                code: 'field',
                apiField: { base: false } as ApiField,
                authId: 1,
                phoneCodes: null,
                defaultPhoneCode: null,
                auth: null,
            },
        ];
    },
    count() {
        return 0;
    },
};
const mockedDefaultMatchingRepo = {
    find(): DefaultMatching[] {
        return [];
    },
};
class BxApiMock {
    async getList(): Promise<{ error?: any; data?: any }> {
        return {
            error: 'not implemented yet',
        };
    }
    async callBXBatch() {
        return new BxApiResult();
    }
    async callBXApi() {
        return new BxApiResult();
    }
}
const bxApiMock = new BxApiMock();
const moduleMocker = new ModuleMocker(global);

const qb_getMany = jest.fn().mockReturnValue([
    {
        code: BX_ENTITY.CONTACT,
        base: true,
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_baseField',
            },
        ],
    },
    {
        code: 'simpleField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_simpleField',
            },
        ],
    },
    {
        code: 'innerField',
        type: 'string',
        propertyPath: 'inner.field',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_innerField',
            },
        ],
    },
    {
        code: 'arrayField',
        type: 'string',
        propertyPath: 'arrayField[].field',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_arrayField',
            },
        ],
    },
    {
        code: 'arrayField2',
        type: 'string',
        multiple: true,
        propertyPath: 'arrayField2[].field',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_arrayField',
            },
        ],
    },
    {
        code: 'linkedField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.COMPANY,
                code: 'BX_linkedField',
                defaultValue: 'by_entity',
            },
        ],
    },
    {
        code: 'listField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_listField',
                childCode: 'BX_listField_childCode',
                childType: BX_ENTITY.LIST,
                childId: 'BX_listId',
                defaultValue: 'by_childType',
            },
        ],
    },
    {
        code: 'spField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_spField',
                childCode: 'BX_spField_childCode',
                childType: BX_ENTITY.SMART_PROCESS,
                childId: 'BX_spId',
            },
        ],
    },
    {
        code: 'addressField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT_ADDRESS,
                code: 'BX_addressField',
                valueType: 'addressType',
            },
        ],
    },
    {
        code: 'workPhoneField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: TypedValues.PHONE,
                valueType: 'workPhone',
            },
        ],
    },
    {
        code: 'faxPhoneField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: TypedValues.PHONE,
                valueType: 'faxPhone',
            },
        ],
    },
    {
        code: 'emailField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: TypedValues.EMAIL,
                valueType: 'email',
            },
        ],
    },
    {
        code: 'fieldWithDefault',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_fieldWithDefault',
                defaultValue: 'by_linkType',
            },
        ],
        linkType: BX_ENTITY.USER,
    },
    {
        code: 'noMatchField',
        type: 'string',
        default: 'defaultWhenNoMatch',
    },
    {
        code: 'dateField',
        type: 'date',
        default: 'invalidDateDefault',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_dateField',
            },
        ],
    },
    {
        code: 'datetimeField',
        type: 'datetime',
        default: 'invalidDateDefault',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_datetimeField',
            },
        ],
    },
    {
        code: 'incorrectDateField',
        type: 'date',
        default: 'invalidDateDefault',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_incorrectDateField',
            },
        ],
    },
    {
        code: 'emptyField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_emptyField',
            },
        ],
    },
    {
        code: 'missingField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CONTACT,
                code: 'BX_missingField',
            },
        ],
    },
    {
        code: 'erroredField',
        type: 'string',
        matching: [
            {
                entity: BX_ENTITY.CRM_STATUS,
                code: 'BX_erroredField',
                childId: 'status_id',
            },
        ],
    }
]);
const qbMock = jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    leftJoinAndMapMany: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: qb_getMany,
}));

const qr_startTransaction = jest.fn().mockReturnThis();
const qr_remove = jest.fn().mockReturnThis();
const qr_save = jest.fn().mockReturnThis();
const qr_commitTransaction = jest.fn().mockReturnThis();
const qr_rollbackTransaction = jest.fn().mockReturnThis();
const qr_release = jest.fn().mockReturnThis();
const qrMock = jest.fn(() => ({
    connect: jest.fn().mockReturnThis(),
    startTransaction: qr_startTransaction,
    manager: {
        remove: qr_remove,
        save: qr_save,
    },
    commitTransaction: qr_commitTransaction,
    rollbackTransaction: qr_rollbackTransaction,
    release: qr_release,
}));

const buildMatchDTO = (data: MatchDto) => {
    if (!data) return null;

    const result = new MatchDto(null);

    result.childCode = data.childCode;
    result.childId = data.childId;
    result.childType = data.childType;
    result.code = data.code;
    result.entity = data.entity;
    result.field = data.field;
    result.phoneCodes = data.phoneCodes;
    result.valueType = data.valueType;
    result.defaultValue = data.defaultValue;
    result.defaultView = data.defaultView;
    result.defaultPhoneCode = data.defaultPhoneCode;

    return result;
};
const buildFieldDTO = (data: FieldDto) => {
    const result = new FieldDto(null);

    result.base = data.base;
    result.code = data.code;
    result.match = buildMatchDTO(data.match);
    result.type = data.type;
    result.propertyPath = data.propertyPath;
    result.default = data.default;
    result.linkType = data.linkType;
    result.multiple = data.multiple;
    result.hint = data.hint;

    return result;
};

const buildBxResult = (data) => {
    const result = new BxApiResult();
    result.data = data;
    return Promise.resolve(result);
};

describe('MatchingService', () => {
    let service: MatchingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchingService,
                ErrorHandler,
                {
                    provide: getRepositoryToken(ApiField),
                    useValue: mockedApiFieldRepo,
                },
                {
                    provide: getRepositoryToken(Matching),
                    useValue: mockedMatchingRepo,
                },
                {
                    provide: getRepositoryToken(DefaultMatching),
                    useValue: mockedDefaultMatchingRepo,
                },
                {
                    provide: BxApiService,
                    useValue: bxApiMock,
                },
                {
                    provide: getDataSourceToken(),
                    useValue: {
                        createQueryBuilder: qbMock,
                        createQueryRunner: qrMock,
                    },
                },
            ],
        })
            .useMocker((token) => {
                if (token?.toString().includes('Repository')) {
                    return {};
                }
                if (typeof token === 'function') {
                    const mockMetadata = moduleMocker.getMetadata(token);
                    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                    return new Mock();
                }
            })
            .compile();
        service = await module.get<MatchingService>(MatchingService);
        // jest.spyOn(service, 'withCheck').mockImplementation(async (domain, callback) => {
        //    return await callback({} as Auth)
        // })
    });

    afterEach(() => jest.clearAllMocks());

    describe('getTimeZone', () => {
        it('should return default offset if exception occurred', () => {
            jest.spyOn(bxApiMock, 'callBXApi').mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service['getTimeZone'](authMock)).resolves.toEqual(3);
        });

        it('should return default offset in bitrix request errored', () => {
            return expect(service['getTimeZone'](authMock)).resolves.toEqual(3);
        });

        it('should return offset', () => {
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(buildBxResult({ TIME_ZONE_OFFSET: 7200 }));
            return expect(service['getTimeZone'](authMock)).resolves.toEqual(2);
        });
    });

    describe('getParentField', () => {
        it('should return null if parent empty', () => {
            expect(MatchingService['getParentField'](null)).toBeNull();
            expect(MatchingService['getParentField'](undefined)).toBeNull();
        });

        it('should return null if match empty', () => {
            expect(MatchingService['getParentField']({} as FieldDto)).toBeNull();
            expect(MatchingService['getParentField']({ match: null } as FieldDto)).toBeNull();
            expect(MatchingService['getParentField']({ match: undefined } as FieldDto)).toBeNull();
        });

        it('should return null for incorrect parent entity', () => {
            expect(MatchingService['getParentField']({ match: { entity: 'wrong' } } as FieldDto)).toBeNull();
        });

        it('should return parent property name', () => {
            expect(MatchingService['getParentField']({ match: { entity: 'CRM_CONTACT' } } as FieldDto)).toEqual('contactId');
            expect(MatchingService['getParentField']({ match: { entity: 'CRM_COMPANY' } } as FieldDto)).toEqual('companyId');
            expect(MatchingService['getParentField']({ match: { entity: 'CRM_', childId: '42' } } as FieldDto)).toEqual('parentId42');
        });
    });

    describe('getCRMEntity', () => {
        it('should return given value', () => {
            expect(MatchingService['getCRMEntity']('string')).toEqual('string');
            expect(MatchingService['getCRMEntity'](null)).toEqual(null);
            expect(MatchingService['getCRMEntity'](undefined)).toEqual(undefined);
        });

        it('should return matched entity', () => {
            expect(MatchingService['getCRMEntity']('CRM_CONTACT')).toEqual('contact');
            expect(MatchingService['getCRMEntity']('CRM_COMPANY')).toEqual('company');
            expect(MatchingService['getCRMEntity']('CRM_')).toEqual('item');
        });
    });

    describe('checkParent', () => {
        it('should return false if parent is not base', () => {
            return expect(service.checkParent(authMock, { base: false } as FieldDto, { base: true } as FieldDto)).resolves.toBeFalse();
        });

        it('should return false if child is not base', () => {
            return expect(service.checkParent(authMock, { base: true } as FieldDto, { base: false } as FieldDto)).resolves.toBeFalse();
        });

        it('should throw internal error if bitrix request failed', () => {
            const parentBase = { base: true } as FieldDto;
            const childBase = { base: true, match: { entity: 'entity' } } as FieldDto;
            jest.spyOn(bxApiMock, 'callBXApi').mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service.checkParent(authMock, parentBase, childBase)).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to get fields from bitrix',
            );
        });

        it('should return false if bitrix request errored', () => {
            const parentBase = { base: true, match: { entity: 'CRM_' } } as FieldDto;
            const childBase = { base: true, match: { entity: 'entity' } } as FieldDto;
            return expect(service.checkParent(authMock, parentBase, childBase)).resolves.toBeFalse();
        });

        it('should return false if no fields found', () => {
            const parentBase = { base: true, match: { entity: 'CRM_' } } as FieldDto;
            const childBase = { base: true, match: { entity: 'entity' } } as FieldDto;
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(buildBxResult({}));
            return expect(service.checkParent(authMock, parentBase, childBase)).resolves.toBeFalse();
        });

        it('should return false', () => {
            const parentBase = { base: true, match: { entity: 'CRM_', childId: '42' } } as FieldDto;
            const childBase = { base: true, match: { entity: 'entity' } } as FieldDto;
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(
                buildBxResult({
                    fields: {
                        parentId24: {},
                    },
                }),
            );
            return expect(service.checkParent(authMock, parentBase, childBase)).resolves.toBeFalse();
        });

        it('should return true', () => {
            const parentBase = { base: true, match: { entity: 'CRM_', childId: '42' } } as FieldDto;
            const childBase = { base: true, match: { entity: 'entity' } } as FieldDto;
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(
                buildBxResult({
                    fields: {
                        parentId42: {},
                    },
                }),
            );
            return expect(service.checkParent(authMock, parentBase, childBase)).resolves.toBeTrue();
        });
    });

    describe('processEnums', () => {
        it('should return if no enum fields', async () => {
            const someCallMock = jest.spyOn(service as any, 'linkedCall');
            await expect(service['processEnums'](authMock, [{ type: 'any' } as FieldDto], [])).toResolve();
            expect(someCallMock).not.toBeCalled();
        });

        it('should throw internal error if bitrix request failed', () => {
            jest.spyOn(bxApiMock, 'callBXBatch').mockImplementationOnce(() => {
                throw 'error';
            });
            jest.spyOn(service as any, 'linkedCall').mockImplementationOnce(() => ({}));
            return expect(service['processEnums'](authMock, [{ type: 'enumeration', base: true } as FieldDto], [])).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to get fields from bitrix',
            );
        });

        it('should set undefined if no enum field found', async () => {
            jest.spyOn(service as any, 'linkedCall').mockImplementationOnce(() => ({}));
            jest.spyOn(bxApiMock, 'callBXBatch').mockReturnValueOnce(buildBxResult({ fields: [] }));
            const data = [
                {
                    enumField: 'VALUE',
                },
            ];
            const fields = [
                {
                    base: true,
                    code: 'enumField',
                    match: {
                        code: 'single',
                    },
                    type: 'enumeration',
                } as FieldDto,
            ];

            await expect(service['processEnums'](authMock, fields, data)).toResolve();
            expect(data[0].enumField).toBeUndefined();
        });

        it('should set undefined if no enum match found', async () => {
            jest.spyOn(service as any, 'linkedCall').mockImplementationOnce(() => ({}));
            jest.spyOn(bxApiMock, 'callBXBatch').mockReturnValueOnce(
                buildBxResult({
                    fields: {
                        single: {
                            items: [
                                {
                                    ID: '42',
                                    VALUE: 'VALUE',
                                },
                            ],
                        },
                    },
                }),
            );
            const data = [
                {
                    enumField: 'MISMATCH',
                },
            ];
            const fields = [
                {
                    base: true,
                    code: 'enumField',
                    match: {
                        code: 'single',
                    },
                    type: 'enumeration',
                } as FieldDto,
            ];

            await expect(service['processEnums'](authMock, fields, data)).toResolve();
            expect(data[0].enumField).toBeUndefined();
        });

        it('should replace value with id', async () => {
            jest.spyOn(service as any, 'linkedCall').mockImplementationOnce(() => ({}));
            jest.spyOn(bxApiMock, 'callBXBatch').mockReturnValueOnce(
                buildBxResult({
                    fields: {
                        single: {
                            items: [
                                {
                                    ID: '42',
                                    VALUE: 'VALUE',
                                },
                            ],
                        },
                    },
                }),
            );
            const data = [
                [
                    {
                        enumField: 'VALUE',
                    },
                ],
            ];
            const fields = [
                {
                    base: true,
                    code: 'enumField',
                    match: {
                        code: 'single',
                    },
                    type: 'enumeration',
                } as FieldDto,
            ];

            await expect(service['processEnums'](authMock, fields, data)).toResolve();
            expect(data[0][0].enumField).toEqual('42');
        });
    });

    describe('getEnum', () => {
        it('should return empty object if no match', () => {
            return expect(service.getEnum(authMock, {} as FieldDto)).resolves.toEqual({});
        });

        it('should return empty object if not enum', () => {
            return expect(service.getEnum(authMock, { type: 'string', match: {} } as FieldDto, {})).resolves.toEqual({});
        });

        it('should throw internal error if bitrix request failed', () => {
            jest.spyOn(bxApiMock, 'callBXApi').mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service.getEnum(authMock, { type: 'enumeration', match: {} } as FieldDto, { a: 1 })).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to get fields from bitrix',
            );
        });

        it('should return empty object if bitrix request errored', () => {
            return expect(service.getEnum(authMock, { type: 'enumeration', match: {} } as FieldDto, {})).resolves.toEqual({});
        });

        it('should return empty object if no fields found', () => {
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(buildBxResult({}));
            return expect(service.getEnum(authMock, { type: 'enumeration', match: { code: 'code' } } as FieldDto, {})).resolves.toEqual({});
        });

        it('should return empty object if no enum field found', () => {
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(
                buildBxResult({
                    fields: {
                        any: {
                            items: [
                                {
                                    ID: 'VALUE',
                                },
                            ],
                        },
                    },
                }),
            );
            return expect(service.getEnum(authMock, { type: 'enumeration', match: { code: 'code' } } as FieldDto, {})).resolves.toEqual({});
        });

        it('should return empty object if enum field items empty', () => {
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(
                buildBxResult({
                    fields: {
                        any: {
                            items: [],
                        },
                    },
                }),
            );
            return expect(service.getEnum(authMock, { type: 'enumeration', match: { code: 'code' } } as FieldDto, {})).resolves.toEqual({});
        });

        it('should return enum', () => {
            jest.spyOn(bxApiMock, 'callBXApi').mockReturnValueOnce(
                buildBxResult({
                    fields: {
                        code: {
                            items: [
                                {
                                    ID: 'VALUE',
                                },
                            ],
                        },
                    },
                }),
            );
            return expect(service.getEnum(authMock, { type: 'enumeration', match: { code: 'code' } } as FieldDto, {})).resolves.toEqual({});
        });
    });

    describe('getIdFiledName', () => {
        it('should return id field name', () => {
            expect(MatchingService['getIdFiledName'](BX_ENTITY.SMART_PROCESS)).toEqual('id');
            expect(MatchingService['getIdFiledName']('any string')).toEqual('ID');
        });
    });

    describe('baseMethod', () => {
        it('should return bx get method', () => {
            expect(service['baseMethod'](authMock, BX_ENTITY.CONTACT)).toEqual('crm.contact.get');
            expect(service['baseMethod'](authMock, BX_ENTITY.COMPANY)).toEqual('crm.company.get');
            expect(service['baseMethod'](authMock, BX_ENTITY.USER)).toEqual('user.get');
            expect(service['baseMethod'](authMock, BX_ENTITY.SMART_PROCESS)).toEqual('crm.item.get');
            expect(service['baseMethod'](authMock, BX_ENTITY.LIST)).toEqual('lists.element.get');
        });

        it('should throw error', () => {
            expect(() => service['baseMethod'](authMock, 'some string')).toThrowError(BadRequestException);
        });
    });

    describe('childMethod', () => {
        it('should return bx get method', () => {
            expect(service['childMethod'](authMock, BX_ENTITY.CONTACT)).toEqual('crm.contact.list');
            expect(service['childMethod'](authMock, BX_ENTITY.COMPANY)).toEqual('crm.company.list');
            expect(service['childMethod'](authMock, BX_ENTITY.USER)).toEqual('user.get');
            expect(service['childMethod'](authMock, BX_ENTITY.SMART_PROCESS)).toEqual('crm.item.list');
            expect(service['childMethod'](authMock, BX_ENTITY.LIST)).toEqual('lists.element.get');
            expect(service['childMethod'](authMock, BX_ENTITY.CRM_STATUS)).toEqual('crm.status.get');
        });

        it('should throw error', () => {
            expect(() => service['childMethod'](authMock, 'some string')).toThrowError(BadRequestException);
        });
    });

    describe('listMethod', () => {
        it('should return bx list method', () => {
            expect(service['listMethod'](authMock, BX_ENTITY.CONTACT)).toEqual('crm.contact.list');
            expect(service['listMethod'](authMock, BX_ENTITY.COMPANY)).toEqual('crm.company.list');
            expect(service['listMethod'](authMock, BX_ENTITY.USER)).toEqual('user.get');
            expect(service['listMethod'](authMock, BX_ENTITY.SMART_PROCESS)).toEqual('crm.item.list');
            expect(service['listMethod'](authMock, BX_ENTITY.LIST)).toEqual('lists.element.list');
        });

        it('should throw error', () => {
            expect(() => service['listMethod'](authMock, 'some string')).toThrowError(BadRequestException);
        });
    });

    describe('updateMethod', () => {
        it('should return bx list method', () => {
            expect(service['updateMethod'](authMock, BX_ENTITY.CONTACT)).toEqual('crm.contact.update');
            expect(service['updateMethod'](authMock, BX_ENTITY.COMPANY, 'add')).toEqual('crm.company.add');
            expect(service['updateMethod'](authMock, BX_ENTITY.CONTACT_ADDRESS)).toEqual('crm.address.add');
            expect(service['updateMethod'](authMock, BX_ENTITY.COMPANY_ADDRESS, 'update')).toEqual('crm.address.add');
            expect(service['updateMethod'](authMock, BX_ENTITY.USER)).toEqual('user.update');
            expect(service['updateMethod'](authMock, BX_ENTITY.SMART_PROCESS, 'add')).toEqual('crm.item.add');
        });

        it('should throw error', () => {
            expect(() => service['updateMethod'](authMock, 'any string')).toThrowError(BadRequestException);
        });
    });

    describe('getResultPathPart', () => {
        it('should return wrapped result part', () => {
            expect(MatchingService['getResultPathPart'](BX_ENTITY.CONTACT, 'any string')).toEqual('');
            expect(MatchingService['getResultPathPart'](BX_ENTITY.COMPANY)).toEqual('');
            expect(MatchingService['getResultPathPart']('any string')).toEqual('');
            expect(MatchingService['getResultPathPart']('any string', 'any string')).toEqual('');
            expect(MatchingService['getResultPathPart']('')).toEqual('');
            expect(MatchingService['getResultPathPart'](BX_ENTITY.SMART_PROCESS)).toEqual('[item]');
            expect(MatchingService['getResultPathPart'](BX_ENTITY.LIST, 'any string')).toEqual('');
        });
    });

    describe('linkedCall', () => {
        const base = {
            entity: BX_ENTITY.CONTACT,
            code: 'baseCode',
        } as MatchDto;
        const match = {
            entity: BX_ENTITY.CONTACT,
            childId: '1',
            childType: BX_ENTITY.SMART_PROCESS,
            code: 'matchCode',
        } as MatchDto;

        it('should return linked call', () => {
            expect(service['linkedCall'](authMock, BX_ENTITY.CONTACT, base, match)).toEqual({
                id: 'CRM_CONTACT',
                method: 'crm.contact.get',
                data: { id: '$result[CRM_CONTACT][CONTACT_ID]' },
            });
            expect(service['linkedCall'](authMock, BX_ENTITY.CONTACT_ADDRESS, base, match)).toEqual({
                id: 'CRM_CONTACT_ADDRESS',
                method: 'crm.address.list',
                data: {
                    filter: {
                        ANCHOR_ID: `$result[CRM_CONTACT][ID]`,
                        ANCHOR_TYPE_ID: 3,
                    },
                },
            });
            expect(service['linkedCall'](authMock, BX_ENTITY.COMPANY_ADDRESS, base, match)).toEqual({
                id: 'CRM_COMPANY_ADDRESS',
                method: 'crm.address.list',
                data: {
                    filter: {
                        ANCHOR_ID: `$result[CRM_CONTACT][ID]`,
                        ANCHOR_TYPE_ID: 4,
                    },
                },
            });
            expect(service['linkedCall'](authMock, BX_ENTITY.COMPANY, base, match)).toEqual({
                id: 'CRM_COMPANY',
                method: 'crm.company.get',
                data: { id: '$result[CRM_CONTACT][COMPANY_ID]' },
            });
            expect(service['linkedCall'](authMock, BX_ENTITY.LIST, base, match)).toEqual({
                id: match.code,
                method: 'lists.element.get',
                data: {
                    IBLOCK_TYPE_ID: 'lists',
                    IBLOCK_ID: '1',
                    ELEMENT_ID: `$result[CRM_CONTACT][matchCode]`,
                },
            });
            expect(service['linkedCall'](authMock, BX_ENTITY.SMART_PROCESS, base, match)).toEqual({
                id: 'matchCode',
                method: 'crm.item.list',
                data: {
                    entityTypeId: '1',
                    filter: {
                        id: '$result[CRM_CONTACT][matchCode]',
                    },
                },
            });
            expect(service['linkedCall'](authMock, BX_ENTITY.CRM_STATUS, base, match)).toEqual({
                id: 'matchCode',
                method: 'crm.status.list',
                data: {
                    filter: {
                        ENTITY_ID: match.childId,
                        STATUS_ID: '$result[CRM_CONTACT][matchCode]',
                    },
                },
            });
        });

        it('should throw error', () => {
            expect(() => service['linkedCall'](authMock, 'any string', base, match)).toThrowError(BadRequestException);
        });
    });

    describe('extendBaseData', () => {
        it('should extend data with SP fields', () => {
            const baseData = { anyField: 'anyValue' };
            MatchingService['extendBaseData'](baseData, { match: { entity: BX_ENTITY.SMART_PROCESS, childId: '1' } } as FieldDto);
            expect(baseData).toEqual({
                anyField: 'anyValue',
                entityTypeId: '1',
            });
        });

        it('should extend data with list fields', () => {
            const baseData = { anyField: 'anyValue' };
            MatchingService['extendBaseData'](baseData, { match: { childType: BX_ENTITY.LIST, childId: '1' } } as FieldDto);
            expect(baseData).toEqual({
                anyField: 'anyValue',
                IBLOCK_TYPE_ID: 'lists',
                IBLOCK_ID: '1',
            });
        });

        it('should not change base data', () => {
            const baseData = { anyField: 'anyValue' };
            MatchingService['extendBaseData'](baseData, { match: { entity: BX_ENTITY.CONTACT } } as FieldDto);
            expect(baseData).toEqual({ anyField: 'anyValue' });

            MatchingService['extendBaseData'](baseData, { match: { childType: BX_ENTITY.CONTACT } } as FieldDto);
            expect(baseData).toEqual({ anyField: 'anyValue' });
        });
    });

    describe('processUpdateData', () => {
        const data = {
            someField: 'someValue',
        };
        const base = {
            match: {
                valueType: 'valueTypeVal',
                childId: 'childIdVal',
            },
        } as FieldDto;

        it('should return crm update data', () => {
            expect(MatchingService['processUpdateData'](data, BX_ENTITY.CONTACT, 42, base)).toEqual({
                id: 42,
                fields: {
                    someField: 'someValue',
                },
            });
        });

        it('should return address update data', () => {
            expect(MatchingService['processUpdateData'](data, BX_ENTITY.CONTACT_ADDRESS, 42, base)).toEqual({
                fields: {
                    TYPE_ID: 'valueTypeVal',
                    ENTITY_TYPE_ID: 3,
                    ENTITY_ID: 42,
                    someField: 'someValue',
                },
            });

            expect(MatchingService['processUpdateData'](data, BX_ENTITY.COMPANY_ADDRESS, 42, base)).toEqual({
                fields: {
                    TYPE_ID: 'valueTypeVal',
                    ENTITY_TYPE_ID: 4,
                    ENTITY_ID: 42,
                    someField: 'someValue',
                },
            });
        });

        it('should return user update data', () => {
            expect(MatchingService['processUpdateData'](data, BX_ENTITY.USER, 0, base)).toEqual({
                someField: 'someValue',
            });
            expect(MatchingService['processUpdateData'](data, BX_ENTITY.USER, 42, base)).toEqual({
                ID: 42,
                someField: 'someValue',
            });
        });

        it('should return sp update data', () => {
            expect(MatchingService['processUpdateData'](data, BX_ENTITY.SMART_PROCESS, 42, base)).toEqual({
                id: 42,
                entityTypeId: 'childIdVal',
                fields: {
                    someField: 'someValue',
                },
            });
        });

        it('should not change data', () => {
            expect(MatchingService['processUpdateData'](data, 'any string', 42, base)).toEqual({
                someField: 'someValue',
            });
        });
    });

    describe('getDefaultCall', () => {
        it('should return default call', () => {
            const field = {
                linkType: BX_ENTITY.USER,
                match: {
                    code: 'matchCode',
                    defaultValue: '1',
                    childType: BX_ENTITY.COMPANY,
                    childId: 'childId',
                    entity: BX_ENTITY.LIST,
                },
            } as FieldDto;

            expect(service['getDefaultCall'](authMock, field)).toEqual({
                id: 'matchCode_default',
                method: 'user.get',
                data: { ID: '1' },
            });

            field.linkType = undefined;
            expect(service['getDefaultCall'](authMock, field)).toEqual({
                id: 'matchCode_default',
                method: 'crm.company.get',
                data: { id: '1' },
            });

            field.match.childType = undefined;
            expect(service['getDefaultCall'](authMock, field)).toEqual({
                id: 'matchCode_default',
                method: 'lists.element.get',
                data: {
                    IBLOCK_TYPE_ID: 'lists',
                    IBLOCK_ID: 'childId',
                    ELEMENT_ID: '1',
                },
            });

            field.linkType = BX_ENTITY.CRM_STATUS;
            expect(service['getDefaultCall'](authMock, field)).toEqual({
                id: 'matchCode_default',
                method: 'crm.status.get',
                data: { id: '1' },
            });
        });

        it('should throw error', () => {
            expect(() => service['getDefaultCall'](authMock, {} as FieldDto)).toThrowError(BadRequestException);
            expect(() => service['getDefaultCall'](authMock, { linkType: 'any string' } as FieldDto)).toThrowError(BadRequestException);
            expect(() => service['getDefaultCall'](authMock, { match: { childType: 'any string' } } as FieldDto)).toThrowError(BadRequestException);
            expect(() => service['getDefaultCall'](authMock, { match: { entity: 'any string' } } as FieldDto)).toThrowError(BadRequestException);
        });
    });

    describe('wrapValue', () => {
        it('should return unchanged phone with plus', () => {
            const field = { type: 'string', match: { code: TypedValues.PHONE, valueType: 'valueType' } } as FieldDto;
            expect(MatchingService['wrapValue']([], '123', field, 0)).toEqual([{ VALUE: '+123', VALUE_TYPE: 'valueType' }]);
            expect(MatchingService['wrapValue']([], '+123', field, 0)).toEqual([{ VALUE: '+123', VALUE_TYPE: 'valueType' }]);
            expect(MatchingService['wrapValue']([], '+0123', field, 0)).toEqual([{ VALUE: '+0123', VALUE_TYPE: 'valueType' }]);
            expect(MatchingService['wrapValue']([], '0123', field, 0)).toEqual([{ VALUE: '+123', VALUE_TYPE: 'valueType' }]);
        });

        it('should return phone with default code', () => {
            const field = { type: 'string', match: { code: TypedValues.PHONE, valueType: 'valueType', defaultPhoneCode: '+1' } } as FieldDto;
            expect(MatchingService['wrapValue']([], '123', field, 0)).toEqual([{ VALUE: '+1123', VALUE_TYPE: 'valueType' }]);
            expect(MatchingService['wrapValue']([], '0123', field, 0)).toEqual([{ VALUE: '+1123', VALUE_TYPE: 'valueType' }]);
            expect(MatchingService['wrapValue']([], '+123', field, 0)).toEqual([{ VALUE: '+1123', VALUE_TYPE: 'valueType' }]);
        });

        it('should return phone with code', () => {
            const field = {
                type: 'string',
                match: { code: TypedValues.PHONE, valueType: 'valueType', defaultPhoneCode: '+1', phoneCodes: ['+2', '+3'] },
            } as FieldDto;
            expect(MatchingService['wrapValue']([], '+23', field, 0)).toEqual(expect.arrayContaining([{ VALUE: '+23', VALUE_TYPE: 'valueType' }]));
            expect(MatchingService['wrapValue']([], '023', field, 0)).toEqual([{ VALUE: '+23', VALUE_TYPE: 'valueType' }]);
            expect(MatchingService['wrapValue']([], '00+23', field, 0)).toEqual([{ VALUE: '+23', VALUE_TYPE: 'valueType' }]);
        });

        it('should extend value array', () => {
            let field = { type: 'string', match: { code: TypedValues.EMAIL, valueType: 'valueType' } } as FieldDto;
            expect(MatchingService['wrapValue']([{ VALUE: 'email1', VALUE_TYPE: 'valueType' }], 'email2', field, 0)).toEqual([
                { VALUE: 'email1', VALUE_TYPE: 'valueType' },
                { VALUE: 'email2', VALUE_TYPE: 'valueType' },
            ]);

            field = { type: 'string', match: { code: TypedValues.WEB, valueType: 'valueType' } } as FieldDto;
            expect(MatchingService['wrapValue']([{ VALUE: 'web1', VALUE_TYPE: 'valueType' }], 'web2', field, 0)).toEqual([
                { VALUE: 'web1', VALUE_TYPE: 'valueType' },
                { VALUE: 'web2', VALUE_TYPE: 'valueType' },
            ]);
        });

        it('should return raw value', () => {
            let field = { type: 'string', match: { code: 'matchCode', valueType: 'valueType' } } as FieldDto;
            expect(MatchingService['wrapValue']([{ VALUE: 'email1', VALUE_TYPE: 'valueType' }], 'any string', field, 0)).toEqual('any string');

            field = { type: 'string', match: { code: 'matchCode' } } as FieldDto;
            expect(MatchingService['wrapValue']([{ VALUE: 'email1', VALUE_TYPE: 'valueType' }], 'any string', field, 0)).toEqual('any string');
        });

        it('should return unchanged date', () => {
            const date = '2022-01-02T03:04:05+03:00';
            const field = { type: 'datetime' } as FieldDto;
            expect(MatchingService['wrapValue'](null, date, field, 3)).toEqual('2022-01-02T03:04:05');
            field.type = 'date';
            expect(MatchingService['wrapValue'](null, date, field, 3)).toEqual('2022-01-02');
        });

        it('should return converted date', () => {
            const date = '2022-01-02T03:04:05+07:00';
            const field = { type: 'datetime' } as FieldDto;
            expect(MatchingService['wrapValue'](null, date, field, 3)).toEqual('2022-01-01T23:04:05');
            field.type = 'date';
            expect(MatchingService['wrapValue'](null, date, field, 3)).toEqual('2022-01-01');
        });

        it('should return bitrix-style boolean', () => {
            let field = { code: 'matchCode' } as FieldDto;
            expect(MatchingService['wrapValue'](null, true, field, 0)).toEqual('Y');

            field = { code: 'matchCode' } as FieldDto;
            expect(MatchingService['wrapValue'](null, false, field, 0)).toEqual('N');

            field = { type: 'boolean', code: 'matchCode' } as FieldDto;
            expect(MatchingService['wrapValue'](null, 'true', field, 0)).toEqual('Y');

            field = { type: 'boolean', code: 'matchCode' } as FieldDto;
            expect(MatchingService['wrapValue'](null, 'false', field, 0)).toEqual('N');

        });
        

        it('should return concatenated string value', () => {
            let field = { code: 'parts', type: 'string' } as FieldDto;
            expect(MatchingService['wrapValue'](null, "asdf", field, 0)).toEqual('asdf');

            field = { code: 'parts', type: 'string' } as FieldDto;
            expect(MatchingService['wrapValue']("asdf", null, field, 0)).toEqual('asdf');

            field = { code: 'parts', type: 'string' } as FieldDto;
            expect(MatchingService['wrapValue']("as", "df", field, 0)).toEqual('as, df');
        });
    });

    describe('matching', () => {
        const fields = [
            {
                code: 'field1',
                match: {
                    code: 'BX_field1',
                },
            },
            {
                code: 'field2',
                match: {
                    code: 'BX_field2',
                },
            },
            {
                code: 'field3',
                match: {
                    code: 'BX_field3',
                },
            },
            {
                code: 'field4',
                match: {
                    code: 'BX_field4',
                },
            },
        ] as FieldDto[];

        it('should transform external type to bitrix with matchData', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => fields);
            const external = {
                field1: 'val1',
                field2: 'val2',
                field3: 'val3',
                unmatchedField: 'unmatchedVal',
            };

            await expect(service.matchData({} as Auth, external, '')).resolves.toEqual({
                BX_field1: 'val1',
                BX_field2: 'val2',
                BX_field3: 'val3',
            });
        });

        it('should return falsy value', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => fields);

            await expect(service.matchData({} as Auth, false, '')).resolves.toEqual(false);
            await expect(service.matchData({} as Auth, undefined, '')).resolves.toEqual(undefined);
            await expect(service.matchData({} as Auth, 0, '')).resolves.toEqual(0);
            await expect(service.matchData({} as Auth, '', '')).resolves.toEqual('');
        });

        it('should return bitrix filed name with getMatch', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => fields);
            await expect(service.getMatch({} as Auth, '', 'field4')).resolves.toEqual('BX_field4');
            await expect(service.getMatch({} as Auth, '', 'unmatched')).resolves.toEqual(undefined);
        });

        it('should return bitrix filed name with static getMatch', () => {
            expect(MatchingService.getMatch(fields, 'field4')).toEqual('BX_field4');
            expect(MatchingService.getMatch(fields, 'unmatched')).toEqual(undefined);
        });
    });

    describe('canHaveUnmatched', () => {
        it('should return true', () => {
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.SMART_PROCESS)).toEqual(true);
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.CONTACT)).toEqual(true);
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.COMPANY)).toEqual(true);
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.USER)).toEqual(true);
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.LIST)).toEqual(true);
            expect(MatchingService['canHaveUnmatched']('any string')).toEqual(true);
        });
        it('should return false', () => {
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.CONTACT_ADDRESS)).toEqual(false);
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.COMPANY_ADDRESS)).toEqual(false);
            expect(MatchingService['canHaveUnmatched'](BX_ENTITY.CRM_STATUS)).toEqual(false);
        });
    });

    describe('pushDataToDataset', () => {
        const bxMap = {
            key1: { keyField: 'key1', id: 1 },
            key2: { keyField: 'key2', ID: 2 },
            key3: { keyField: 'key3', ID: 3 },
            key4: { keyField: 'key4', ID: 4 },
            key5: { keyField: 'key5', ID: 5 },
        };

        const dataSet = {};

        it('should create new add entity array in data set', () => {
            MatchingService.pushDataToDataset(dataSet, 'entity1', { keyField: 'key0' }, bxMap, 'key0');
            expect(dataSet).toEqual({
                entity1: {
                    0: [{ keyField: 'key0' }],
                },
            });
        });

        it('should push create entity in data set', () => {
            MatchingService.pushDataToDataset(dataSet, 'entity1', { keyField: 'key1' }, bxMap, 'key1');
            expect(dataSet).toEqual({
                entity1: {
                    0: [{ keyField: 'key0' }, { keyField: 'key1' }],
                },
            });
        });

        it('should create new entity in data set with another entity', () => {
            MatchingService.pushDataToDataset(dataSet, 'entity2', { keyField: 'key0' }, bxMap, 'key0');
            expect(dataSet).toEqual({
                entity1: {
                    0: [{ keyField: 'key0' }, { keyField: 'key1' }],
                },
                entity2: {
                    0: [{ keyField: 'key0' }],
                },
            });
        });

        it('should push update entity in data set with default idField', () => {
            MatchingService.pushDataToDataset(dataSet, 'entity1', { keyField: 'key2' }, bxMap, 'key2');
            expect(dataSet).toEqual({
                entity1: {
                    0: [{ keyField: 'key0' }, { keyField: 'key1' }],
                    2: { keyField: 'key2' },
                },
                entity2: {
                    0: [{ keyField: 'key0' }],
                },
            });
        });

        it('should push update entity in data set with custom idField', () => {
            MatchingService.pushDataToDataset(dataSet, 'entity1', { keyField: 'key1' }, bxMap, 'key1', 'id');
            expect(dataSet).toEqual({
                entity1: {
                    0: [{ keyField: 'key0' }, { keyField: 'key1' }],
                    2: { keyField: 'key2' },
                    1: { keyField: 'key1' },
                },
                entity2: {
                    0: [{ keyField: 'key0' }],
                },
            });
        });
    });

    describe('getListValues', () => {
        const fields = [
            {
                code: 'listFieldNoMatch',
            },
            {
                code: 'listFieldNoChild',
                match: {},
            },
            {
                code: 'listFieldEntityMismatch',
                match: {
                    childId: '1',
                    childType: 'any string',
                },
            },
            {
                code: 'listField',
                match: {
                    childId: '1',
                    childCode: 'childCode',
                    childType: BX_ENTITY.LIST,
                },
            },
        ] as FieldDto[];

        it('should return empty object if field missed', async () => {
            await expect(service.getListValues({} as Auth, fields, 'missedField')).resolves.toEqual({});
        });

        it('should return empty object if field not matched', async () => {
            await expect(service.getListValues({} as Auth, fields, 'listFieldNoMatch')).resolves.toEqual({});
        });

        it("should return empty object if field's match childId missed", async () => {
            await expect(service.getListValues({} as Auth, fields, 'listFieldNoChild')).resolves.toEqual({});
        });

        it('should return empty object with wrong entity', async () => {
            await expect(service.getListValues({} as Auth, fields, 'listFieldEntityMismatch')).resolves.toEqual({});
        });

        it('should return empty object if bitrix error occurred', async () => {
            await expect(service.getListValues({} as Auth, fields, 'listField')).resolves.toEqual({});
        });

        it('should return external-bitrix values map', async () => {
            jest.spyOn(bxApiMock, 'getList').mockImplementation(async () => {
                return {
                    data: [
                        { ID: 1, childCode: { PROPERTY_123: 'externalValue1' } },
                        { ID: 2, otherField: 'any val' },
                        { ID: 3, childCode: 'externalValue3' },
                    ],
                };
            });
            await expect(service.getListValues({} as Auth, fields, 'listField')).resolves.toEqual({
                externalValue1: 1,
                externalValue3: 3,
            });
        });
    });

    describe('pushAddressRequest', () => {
        const fields = [
            {
                match: {
                    entity: BX_ENTITY.CONTACT_ADDRESS,
                },
            },
            {},
        ] as FieldDto[];
        const base = {
            match: {
                entity: BX_ENTITY.CONTACT,
            },
        } as FieldDto;

        it('should return same batch with empty fields', () => {
            jest.spyOn(service as any, 'generateSaveRequest').mockImplementation(() => [{ method: 'address batch', data: {} }]);
            expect(
                service['pushAddressRequest'](
                    {} as Auth,
                    [],
                    [],
                    {
                        match: {
                            entity: 'any string',
                        },
                    } as FieldDto,
                    {},
                    'any string',
                ),
            ).toEqual([]);
        });

        it('should return same batch with wrong entity', () => {
            jest.spyOn(service as any, 'generateSaveRequest').mockImplementation(() => [{ method: 'address batch', data: {} }]);
            expect(
                service['pushAddressRequest'](
                    {} as Auth,
                    [],
                    fields,
                    {
                        match: {
                            entity: 'any string',
                        },
                    } as FieldDto,
                    {},
                    'any string',
                ),
            ).toEqual([]);
        });

        it('should return same batch with no address fields', () => {
            jest.spyOn(service as any, 'generateSaveRequest').mockImplementation(() => [{ method: 'address batch', data: {} }]);
            expect(
                service['pushAddressRequest'](
                    {} as Auth,
                    [],
                    [
                        {
                            match: {
                                entity: 'any string',
                            },
                        },
                    ] as FieldDto[],
                    base,
                    {},
                    'any string',
                ),
            ).toEqual([]);
        });

        it('should add address call', () => {
            jest.spyOn(service as any, 'generateSaveRequest').mockImplementation(() => [{ method: 'address batch', data: {} }]);

            expect(service['pushAddressRequest']({} as Auth, [], fields, base, {}, 'any string')).toEqual([{ method: 'address batch', data: {} }]);
            expect(
                service['pushAddressRequest'](
                    {} as Auth,
                    [],
                    [
                        {
                            match: {
                                entity: BX_ENTITY.COMPANY_ADDRESS,
                            },
                        },
                    ] as FieldDto[],
                    {
                        match: {
                            entity: BX_ENTITY.COMPANY,
                        },
                    } as FieldDto,
                    {},
                    'any string',
                ),
            ).toEqual([{ method: 'address batch', data: {} }]);
        });
    });

    describe('generateChildrenBatch', () => {
        it('should generate child calls', () => {
            const fields = [
                {
                    code: 'company',
                    match: {
                        code: 'COMPANY_ID',
                        childType: BX_ENTITY.COMPANY,
                        childCode: 'TITLE',
                    },
                },
                {
                    code: 'list',
                    match: {
                        code: 'LIST_FIELD',
                        childType: BX_ENTITY.LIST,
                        childCode: 'PROPERTY_1',
                        childId: '1',
                    },
                },
                {
                    code: 'sp',
                    match: {
                        code: 'SP_FIELD',
                        childType: BX_ENTITY.SMART_PROCESS,
                        childCode: 'crmUfField',
                        childId: '2',
                    },
                },
            ] as FieldDto[];

            expect(service['generateChildrenBatch'](authMock, fields, { company: 'company name', list: 'list property', sp: 'sp field' }, 'main')).toEqual([
                {
                    id: 'main_COMPANY_ID',
                    method: 'crm.company.list',
                    data: { FILTER: { TITLE: 'company name' } },
                },
                {
                    id: 'main_LIST_FIELD',
                    method: 'lists.element.get',
                    data: { FILTER: { PROPERTY_1: 'list property' }, IBLOCK_ID: '1', IBLOCK_TYPE_ID: 'lists' },
                },
                {
                    id: 'main_SP_FIELD',
                    method: 'crm.item.list',
                    data: { FILTER: { crmUfField: 'sp field' }, entityTypeId: '2' },
                },
            ]);
        });
    });

    describe('generateRequest', () => {
        it('should throw error if no base found', () => {
            expect(() => service['generateRequest'](authMock, [], {})).toThrowError(BadRequestException);
        });
    });

    describe('prepareData', () => {
        const expectedBxRequest: IBxApiCall[] = [
            {
                id: 'CRM_CONTACT',
                method: 'crm.contact.get',
                data: { id: 1 },
            },
            {
                id: 'BX_linkedField_default',
                method: 'crm.company.get',
                data: { id: 'by_entity' },
            },
            {
                id: 'CRM_COMPANY',
                method: 'crm.company.get',
                data: { id: '$result[CRM_CONTACT][COMPANY_ID]' },
            },
            {
                id: 'BX_listField_default',
                method: 'lists.element.get',
                data: { ELEMENT_ID: 'by_childType', IBLOCK_ID: 'BX_listId', IBLOCK_TYPE_ID: 'lists' },
            },
            {
                id: 'BX_listField',
                method: 'lists.element.get',
                data: { ELEMENT_ID: '$result[CRM_CONTACT][BX_listField]', IBLOCK_ID: 'BX_listId', IBLOCK_TYPE_ID: 'lists' },
            },
            {
                id: 'BX_spField',
                method: 'crm.item.list',
                data: { entityTypeId: 'BX_spId', filter: { id: '$result[CRM_CONTACT][BX_spField]' } },
            },
            {
                id: 'CRM_CONTACT_ADDRESS',
                method: 'crm.address.list',
                data: { filter: { ANCHOR_ID: '$result[CRM_CONTACT][ID]', ANCHOR_TYPE_ID: 3 } },
            },
            {
                id: 'BX_fieldWithDefault_default',
                method: 'user.get',
                data: { ID: 'by_linkType' },
            },
            {
                id: 'BX_erroredField',
                method: 'crm.status.list',
                data: {
                    filter: {
                        ENTITY_ID: 'status_id',
                        STATUS_ID: '$result[CRM_CONTACT][BX_erroredField]',
                    },
                },
            },
        ];

        const bxResponse: BxApiResult<any> = new BxApiResult();
        bxResponse.result['CRM_CONTACT'] = {
            BX_baseField: 1,
            BX_simpleField: 'simple',
            BX_innerField: 'inner',
            BX_arrayField: ['array', 'array2'],
            COMPANY_ID: 2,
            BX_listField: 'listId',
            BX_spField: 'spId',
            [TypedValues.PHONE]: [
                { VALUE_TYPE: 'workPhone', VALUE: 'workPhone' },
                { VALUE_TYPE: 'faxPhone', VALUE: 'faxPhone' },
            ],
            [TypedValues.EMAIL]: [{ VALUE_TYPE: 'email', VALUE: 'email' }],
            BX_fieldWithDefault: 'user_id',
            unmatchedField1: 'unmatched1',
            unmatchedField2: 'unmatched2',
            BX_dateField: '2022-05-17T13:35:34.023Z',
            BX_datetimeField: '2022-05-17T13:35:34.023Z',
            BX_incorrectDateField: 'invalid date',
            BX_emptyField: '',
            BX_stringField2Parts: 'part1, part2'
        };
        bxResponse.result['CRM_COMPANY'] = {
            ID: 2,
            BX_linkedField: 'linked',
        };
        bxResponse.result['BX_listField'] = {
            items: [
                {
                    BX_listField_childCode: { PROPERTY_123: 'list' },
                },
            ],
        };
        bxResponse.result['BX_spField'] = [
            {
                BX_spField_childCode: 'sp',
            },
        ];
        bxResponse.result['CRM_CONTACT_ADDRESS'] = [
            {
                BX_addressField: { prop: 'address' },
            },
        ];
        bxResponse.result['BX_fieldWithDefault'] = [
            {
                ID: 5,
            },
        ];
        bxResponse.result['BX_linkedField_default'] = {
            items: [
                {
                    ID: 2,
                    someField: 'someVal',
                    BX_linkedField: 'linked_default',
                },
            ],
        };
        bxResponse.result['BX_listField_default'] = {
            item: {
                someField: 'someVal',
                BX_listField_childCode: { PROPERTY_123: 'list_default' },
            },
        };
        bxResponse.result['BX_fieldWithDefault_default'] = [
            {
                ID: 'ID_field_default',
                someField: 'someVal',
                BX_fieldWithDefault: 'user_id_default',
            },
        ];
        bxResponse.errors['CRM_STATUS'] = { message: 'some error' };

        it('should return empty object', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => []);
            await expect(service.prepareData({} as Auth, 'any', {})).resolves.toEqual({});
        });

        it('should throw error', async () => {
            const bxMock = jest.spyOn(bxApiMock, 'callBXBatch').mockImplementation(async () => {
                throw 'error';
            });
            await expect(service.prepareData({} as Auth, 'any', { id: 1 })).rejects.toThrowError(InternalServerErrorException);
            expect(bxMock).toHaveBeenCalledWith({}, expectedBxRequest);
        });

        it('should transform bitrix response to external entity', async () => {
            const bxMock = jest.spyOn(bxApiMock, 'callBXBatch').mockImplementation(async () => Promise.resolve(bxResponse));
            const expectedResult = {
                CRM_CONTACT: 1,
                addressField: 'address',
                arrayField: [
                    {
                        field: 'array',
                    },
                ],
                arrayField2: [
                    {
                        field: ['array', 'array2'],
                    },
                ],
                emailField: 'email',
                faxPhoneField: 'faxPhone',
                fieldWithDefault: 'user_id',
                inner: {
                    field: 'inner',
                },
                linkedField: 'linked',
                listField: 'list',
                raws: {
                    listField: [
                        {
                            BX_listField_childCode: {
                                PROPERTY_123: 'list',
                            },
                        },
                    ],
                    spField: [
                        {
                            BX_spField_childCode: 'sp',
                        },
                    ],
                },
                simpleField: 'simple',
                spField: 'sp',
                unmatchedField1: 'unmatched1',
                unmatchedField2: 'unmatched2',
                workPhoneField: 'workPhone',
                defaults: {
                    linkedField: 'linked_default',
                    listField: {
                        PROPERTY_123: 'list_default',
                    },
                    fieldWithDefault: 'ID_field_default',
                },
                noMatchField: 'defaultWhenNoMatch',
                dateField: '2022-05-17',
                datetimeField: '2022-05-17T13:35:34.023Z',
                incorrectDateField: 'invalidDateDefault',
                emptyField: undefined,
                missingField: undefined,
                erroredField: undefined,
            };

            await expect(
                service.prepareData({} as Auth, BX_ENTITY.CONTACT, { id: 1 }, { [BX_ENTITY.CONTACT]: ['unmatchedField1', 'unmatchedField2'] }),
            ).resolves.toEqual(expectedResult);
            expect(bxMock).toHaveBeenCalledWith({}, expectedBxRequest);
        });
    });

    describe('prepareList', () => {
        const expectedBxRequest = {
            method: 'crm.contact.list',
            data: { filter: { someField: 'someFieldVal' } },
        };

        it('should return empty array if no matching found', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => []);
            await expect(service.prepareList({} as Auth, 'any', {})).resolves.toEqual([]);
        });

        it('should return empty array if no entities in bitrix', async () => {
            const bxResponse: BxApiResult<any> = new BxApiResult();
            bxResponse.result['single'] = { items: [] };

            const bxMock = jest.spyOn(bxApiMock, 'callBXApi').mockImplementation(async () => Promise.resolve(bxResponse));

            const result = await service.prepareList(
                {} as Auth,
                BX_ENTITY.CONTACT,
                { filter: { someField: 'someFieldVal' } },
                { [BX_ENTITY.CONTACT]: ['unmatchedField1', 'unmatchedField2'] },
            );

            expect(bxMock).toHaveBeenCalledWith({}, expectedBxRequest);
            expect(result).toEqual([]);
        });

        it('should throw error if no base match', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => [{} as FieldDto]);
            await expect(service.prepareList({} as Auth, 'any', {})).rejects.toThrowError(BadRequestException);
        });

        it('should throw error', async () => {
            const bxMock = jest.spyOn(bxApiMock, 'callBXApi').mockImplementation(async () => {
                throw 'error';
            });
            await expect(service.prepareList({} as Auth, 'any', { filter: { someField: 'someFieldVal' } })).rejects.toThrowError(InternalServerErrorException);
            expect(bxMock).toHaveBeenCalledWith({}, expectedBxRequest);
        });

        it('should transform bitrix response to external entity list', async () => {
            const bxResponse: BxApiResult<any> = new BxApiResult();
            bxResponse.result['single'] = [
                {
                    BX_baseField: 1,
                    BX_simpleField: 'simple',
                    BX_innerField: 'inner',
                    BX_arrayField: ['array', 'array2'],
                    COMPANY_ID: 2,
                    BX_listField: 'listId',
                    BX_spField: 'spId',
                    [TypedValues.PHONE]: [
                        { VALUE_TYPE: 'workPhone', VALUE: 'workPhone' },
                        { VALUE_TYPE: 'faxPhone', VALUE: 'faxPhone' },
                    ],
                    [TypedValues.EMAIL]: [{ VALUE_TYPE: 'email', VALUE: 'email' }],
                    BX_fieldWithDefault: 'user_id',
                    unmatchedField1: 'unmatched1',
                    unmatchedField2: 'unmatched2',
                    BX_dateField: '2022-05-17T13:35:34.023Z',
                    BX_datetimeField: '2022-05-17T13:35:34.023Z',
                    BX_incorrectDateField: 'invalid date',
                    BX_emptyField: '',
                },
            ];

            const expectedResult = [
                {
                    CRM_CONTACT: 1,
                    arrayField: [
                        {
                            field: 'array',
                        },
                    ],
                    arrayField2: [
                        {
                            field: ['array', 'array2'],
                        },
                    ],
                    emailField: 'email',
                    faxPhoneField: 'faxPhone',
                    fieldWithDefault: 'user_id',
                    inner: {
                        field: 'inner',
                    },
                    simpleField: 'simple',
                    unmatchedField1: 'unmatched1',
                    unmatchedField2: 'unmatched2',
                    workPhoneField: 'workPhone',
                    noMatchField: 'defaultWhenNoMatch',
                    dateField: '2022-05-17',
                    datetimeField: '2022-05-17T13:35:34.023Z',
                    incorrectDateField: 'invalidDateDefault',
                    emptyField: undefined,
                    missingField: undefined,
                    erroredField: undefined,
                    raws: {},
                },
            ];
            const bxMock = jest.spyOn(bxApiMock, 'callBXApi').mockImplementation(async () => Promise.resolve(bxResponse));

            await expect(
                service.prepareList(
                    {} as Auth,
                    BX_ENTITY.CONTACT,
                    { filter: { someField: 'someFieldVal' } },
                    { [BX_ENTITY.CONTACT]: ['unmatchedField1', 'unmatchedField2'] },
                ),
            ).resolves.toEqual(expectedResult);

            expect(bxMock).toHaveBeenCalledWith({}, expectedBxRequest);
        });
    });

    describe('transform', () => {
        const bxResponse = {
            BX_baseField: 1,
            BX_simpleField: 'simple',
            BX_innerField: 'inner',
            BX_arrayField: ['array', 'array2'],
            COMPANY_ID: 2,
            BX_listField: 'listId',
            BX_spField: 'spId',
            [TypedValues.PHONE]: [
                { VALUE_TYPE: 'workPhone', VALUE: 'workPhone' },
                { VALUE_TYPE: 'faxPhone', VALUE: 'faxPhone' },
            ],
            [TypedValues.EMAIL]: [{ VALUE_TYPE: 'email', VALUE: 'email' }],
            BX_fieldWithDefault: 'user_id',
            unmatchedField1: 'unmatched1',
            unmatchedField2: 'unmatched2',
            BX_dateField: '2022-05-17T13:35:34.023Z',
            BX_datetimeField: '2022-05-17T13:35:34.023Z',
            BX_incorrectDateField: 'invalid date',
            BX_emptyField: '',
        };

        const expectedResult = {
            CRM_CONTACT: 1,
            arrayField: [
                {
                    field: 'array',
                },
            ],
            arrayField2: [
                {
                    field: ['array', 'array2'],
                },
            ],
            emailField: 'email',
            faxPhoneField: 'faxPhone',
            fieldWithDefault: 'user_id',
            inner: {
                field: 'inner',
            },
            simpleField: 'simple',
            unmatchedField1: 'unmatched1',
            unmatchedField2: 'unmatched2',
            workPhoneField: 'workPhone',
            noMatchField: 'defaultWhenNoMatch',
            dateField: '2022-05-17',
            datetimeField: '2022-05-17T13:35:34.023Z',
            incorrectDateField: 'invalidDateDefault',
            emptyField: undefined,
            missingField: undefined,
            erroredField: undefined,
            raws: {},
        };

        it('should return empty object if no matching found', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => []);
            await expect(service.transform({} as Auth, 'any', {})).resolves.toEqual({});
        });

        it('should return empty array if no matching found', async () => {
            jest.spyOn(service, 'get').mockImplementation(async () => []);
            await expect(service.transform({} as Auth, 'any', [])).resolves.toEqual([]);
        });

        it('should return external entity', async () => {
            await expect(
                service.transform({} as Auth, BX_ENTITY.CONTACT, bxResponse, { [BX_ENTITY.CONTACT]: ['unmatchedField1', 'unmatchedField2'] }),
            ).resolves.toEqual(expectedResult);
        });

        it('should return array of external entities', async () => {
            await expect(
                service.transform({} as Auth, BX_ENTITY.CONTACT, [bxResponse], { [BX_ENTITY.CONTACT]: ['unmatchedField1', 'unmatchedField2'] }),
            ).resolves.toEqual([expectedResult]);
        });
    });

    describe('saveData', () => {
        const externalEntity = {
            callIdField: 'callId',
            addressField: 'address',
            arrayField: [
                {
                    field: 'array',
                },
            ],
            arrayField2: [
                {
                    field: ['array', 'array2'],
                },
            ],
            emailField: 'email',
            faxPhoneField: 'faxPhone',
            fieldWithDefault: 'user_id',
            inner: {
                field: 'inner',
            },
            linkedField: 'linked',
            listField: 'list',
            simpleField: 'simple',
            spField: 'sp',
            unmatchedField1: 'unmatched1',
            unmatchedField2: 'unmatched2',
            workPhoneField: 'workPhone',
            noMatchField: 'defaultWhenNoMatch',
            dateField: '2022-05-17',
            datetimeField: '2022-05-17T13:35:34.023Z',
            incorrectDateField: 'invalidDateDefault',
            emptyField: '',
            missingField: 'missingField',
            erroredField: 'erroredField',
        };
        const dataSet = {
            [BX_ENTITY.CONTACT]: {
                0: [
                    {
                        ...externalEntity,
                        hasUnmatched: true,
                    },
                ],
                1: {
                    ...externalEntity,
                    unmatchedData: {
                        unmatched: 'unmatchedObject',
                    },
                },
            },
            [BX_ENTITY.COMPANY]: {
                0: externalEntity,
                1: [externalEntity],
            },
        };

        it('should do nothing without dataset', async () => {
            const bxMock = jest.spyOn(bxApiMock, 'callBXBatch');
            await service.saveData({} as Auth, null);
            expect(bxMock).not.toBeCalled();
        });

        it('should throw error', async () => {
            jest.spyOn(bxApiMock, 'callBXBatch').mockImplementationOnce(async () => {
                throw 'error';
            });
            await expect(service.saveData({} as Auth, { a: { b: 1 } })).rejects.toThrowError(InternalServerErrorException);
        });

        it('should save data to bitrix', async () => {
            const expectedBatch = [
                {
                    id: 'callId_BX_listField',
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: 'callId_BX_spField',
                    method: 'crm.item.list',
                    data: {
                        FILTER: { BX_spField_childCode: 'sp' },
                        entityTypeId: 'BX_spId',
                    },
                },
                {
                    id: 'callId',
                    method: 'crm.contact.add',
                    data: {
                        fields: {
                            BX_arrayField: ['array', 'array2'],
                            BX_dateField: '2022-05-17',
                            BX_datetimeField: '2022-05-17T16:35:34',
                            BX_emptyField: '',
                            BX_fieldWithDefault: 'user_id',
                            BX_incorrectDateField: null,
                            BX_innerField: 'inner',
                            BX_listField: '$result[callId_BX_listField][0][ID]',
                            BX_missingField: 'missingField',
                            BX_simpleField: 'simple',
                            BX_spField: '$result[callId_BX_spField][items][0][id]',
                            EMAIL: [{ VALUE: 'email', VALUE_TYPE: 'email' }],
                            PHONE: [
                                { VALUE: '+workPhone', VALUE_TYPE: 'workPhone' },
                                { VALUE: '+faxPhone', VALUE_TYPE: 'faxPhone' },
                            ],
                            callIdField: 'callId',
                            noMatchField: 'defaultWhenNoMatch',
                            unmatchedField1: 'unmatched1',
                            unmatchedField2: 'unmatched2',
                        },
                        id: '0',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.address.add',
                    data: {
                        fields: {
                            BX_addressField: 'address',
                            ENTITY_ID: '$result[callId]',
                            ENTITY_TYPE_ID: 3,
                            TYPE_ID: 'addressType',
                        },
                    },
                },
                {
                    id: 'callId_BX_listField',
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: 'callId_BX_spField',
                    method: 'crm.item.list',
                    data: {
                        FILTER: { BX_spField_childCode: 'sp' },
                        entityTypeId: 'BX_spId',
                    },
                },
                {
                    id: 'callId',
                    method: 'crm.contact.update',
                    data: {
                        fields: {
                            BX_arrayField: ['array', 'array2'],
                            BX_dateField: '2022-05-17',
                            BX_datetimeField: '2022-05-17T16:35:34',
                            BX_emptyField: '',
                            BX_fieldWithDefault: 'user_id',
                            BX_incorrectDateField: null,
                            BX_innerField: 'inner',
                            BX_listField: '$result[callId_BX_listField][0][ID]',
                            BX_missingField: 'missingField',
                            BX_simpleField: 'simple',
                            BX_spField: '$result[callId_BX_spField][items][0][id]',
                            EMAIL: [{ VALUE: 'email', VALUE_TYPE: 'email' }],
                            PHONE: [
                                { VALUE: '+workPhone', VALUE_TYPE: 'workPhone' },
                                { VALUE: '+faxPhone', VALUE_TYPE: 'faxPhone' },
                            ],
                            unmatched: 'unmatchedObject',
                        },
                        id: '1',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.address.add',
                    data: {
                        fields: {
                            BX_addressField: 'address',
                            ENTITY_ID: '1',
                            ENTITY_TYPE_ID: 3,
                            TYPE_ID: 'addressType',
                        },
                    },
                },
                {
                    id: 'callId_BX_listField',
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: 'callId_BX_spField',
                    method: 'crm.item.list',
                    data: {
                        FILTER: { BX_spField_childCode: 'sp' },
                        entityTypeId: 'BX_spId',
                    },
                },
                {
                    id: 'callId',
                    method: 'crm.contact.add',
                    data: {
                        fields: {
                            BX_arrayField: ['array', 'array2'],
                            BX_dateField: '2022-05-17',
                            BX_datetimeField: '2022-05-17T16:35:34',
                            BX_emptyField: '',
                            BX_fieldWithDefault: 'user_id',
                            BX_incorrectDateField: null,
                            BX_innerField: 'inner',
                            BX_listField: '$result[callId_BX_listField][0][ID]',
                            BX_missingField: 'missingField',
                            BX_simpleField: 'simple',
                            BX_spField: '$result[callId_BX_spField][items][0][id]',
                            EMAIL: [{ VALUE: 'email', VALUE_TYPE: 'email' }],
                            PHONE: [
                                { VALUE: '+workPhone', VALUE_TYPE: 'workPhone' },
                                { VALUE: '+faxPhone', VALUE_TYPE: 'faxPhone' },
                            ],
                        },
                        id: '0',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.address.add',
                    data: {
                        fields: {
                            BX_addressField: 'address',
                            ENTITY_ID: '$result[callId]',
                            ENTITY_TYPE_ID: 3,
                            TYPE_ID: 'addressType',
                        },
                    },
                },
                {
                    id: 'callId_BX_listField',
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: 'callId_BX_spField',
                    method: 'crm.item.list',
                    data: {
                        FILTER: { BX_spField_childCode: 'sp' },
                        entityTypeId: 'BX_spId',
                    },
                },
                {
                    id: 'callId',
                    method: 'crm.contact.update',
                    data: {
                        fields: {
                            BX_arrayField: ['array', 'array2'],
                            BX_dateField: '2022-05-17',
                            BX_datetimeField: '2022-05-17T16:35:34',
                            BX_emptyField: '',
                            BX_fieldWithDefault: 'user_id',
                            BX_incorrectDateField: null,
                            BX_innerField: 'inner',
                            BX_listField: '$result[callId_BX_listField][0][ID]',
                            BX_missingField: 'missingField',
                            BX_simpleField: 'simple',
                            BX_spField: '$result[callId_BX_spField][items][0][id]',
                            EMAIL: [{ VALUE: 'email', VALUE_TYPE: 'email' }],
                            PHONE: [
                                { VALUE: '+workPhone', VALUE_TYPE: 'workPhone' },
                                { VALUE: '+faxPhone', VALUE_TYPE: 'faxPhone' },
                            ],
                        },
                        id: '1',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.address.add',
                    data: {
                        fields: {
                            BX_addressField: 'address',
                            ENTITY_ID: '1',
                            ENTITY_TYPE_ID: 3,
                            TYPE_ID: 'addressType',
                        },
                    },
                },
            ];

            const bxMock = jest.spyOn(bxApiMock, 'callBXBatch');
            await service.saveData({} as Auth, dataSet, 'callIdField');
            expect(bxMock).toHaveBeenCalledWith({}, expectedBatch);
        });

        it('should save some fields only', async () => {
            const expectedBatch = [
                {
                    id: expect.toEndWith('_BX_listField'),
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.contact.add',
                    data: {
                        fields: {
                            BX_listField: expect.toEndWith('_BX_listField][0][ID]'),
                            BX_simpleField: 'simple',
                            callIdField: 'callId',
                            addressField: 'address',
                            emailField: 'email',
                            faxPhoneField: 'faxPhone',
                            fieldWithDefault: 'user_id',
                            linkedField: 'linked',
                            spField: 'sp',
                            unmatchedField1: 'unmatched1',
                            unmatchedField2: 'unmatched2',
                            workPhoneField: 'workPhone',
                            noMatchField: 'defaultWhenNoMatch',
                            dateField: '2022-05-17',
                            datetimeField: '2022-05-17T13:35:34.023Z',
                            incorrectDateField: 'invalidDateDefault',
                            emptyField: '',
                            missingField: 'missingField',
                            erroredField: 'erroredField',
                        },
                        id: '0',
                    },
                },
                {
                    id: expect.toEndWith('_BX_listField'),
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.contact.update',
                    data: {
                        fields: {
                            BX_listField: expect.toEndWith('_BX_listField][0][ID]'),
                            BX_simpleField: 'simple',
                            unmatched: 'unmatchedObject',
                        },
                        id: '1',
                    },
                },
                {
                    id: expect.toEndWith('_BX_listField'),
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.contact.add',
                    data: {
                        fields: {
                            BX_listField: expect.toEndWith('_BX_listField][0][ID]'),
                            BX_simpleField: 'simple',
                        },
                        id: '0',
                    },
                },
                {
                    id: expect.toEndWith('_BX_listField'),
                    method: 'lists.element.get',
                    data: {
                        FILTER: { BX_listField_childCode: 'list' },
                        IBLOCK_ID: 'BX_listId',
                        IBLOCK_TYPE_ID: 'lists',
                    },
                },
                {
                    id: expect.toBeString(),
                    method: 'crm.contact.update',
                    data: {
                        fields: {
                            BX_listField: expect.toEndWith('_BX_listField][0][ID]'),
                            BX_simpleField: 'simple',
                        },
                        id: '1',
                    },
                },
            ];

            const bxMock = jest.spyOn(bxApiMock, 'callBXBatch');
            await service.saveData({} as Auth, dataSet, null, ['simpleField', 'listField']);
            expect(bxMock).toHaveBeenCalledWith({}, expectedBatch);
        });

        it('should call batch equal to saveDataTest result', async () => {
            const fieldsWithoutAddress = qb_getMany
                .getMockImplementation()()
                .filter((f) => !f.matching?.find((m) => m.entity === BX_ENTITY.CONTACT_ADDRESS));
            // мокаем на два вызова только для этого теста
            qb_getMany.mockReturnValueOnce(fieldsWithoutAddress).mockReturnValueOnce(fieldsWithoutAddress);
            const expectedBatch = await service.saveDataTest(authMock, BX_ENTITY.CONTACT, dataSet[BX_ENTITY.CONTACT], 'callIdField');

            const bxMock = jest.spyOn(bxApiMock, 'callBXBatch');
            await service.saveData({} as Auth, { [BX_ENTITY.CONTACT]: dataSet[BX_ENTITY.CONTACT] }, 'callIdField');

            expect(bxMock).toHaveBeenCalledWith({}, expectedBatch);
        });

        it('should call some fields batch equal to saveDataTest result', async () => {
            const expectedBatch = await service.saveDataTest(authMock, BX_ENTITY.CONTACT, dataSet[BX_ENTITY.CONTACT], 'callIdField', [
                'simpleField',
                'listField',
            ]);

            const bxMock = jest.spyOn(bxApiMock, 'callBXBatch');
            await service.saveData({} as Auth, { [BX_ENTITY.CONTACT]: dataSet[BX_ENTITY.CONTACT] }, 'callIdField', ['simpleField', 'listField']);
            expect(bxMock).toHaveBeenCalledWith({}, expectedBatch);
        });

        it('should return empty batch if no fields found', () => {
            jest.spyOn(service, 'get').mockImplementationOnce(async () => []);
            return expect(service.saveDataTest(authMock, BX_ENTITY.CONTACT, dataSet[BX_ENTITY.CONTACT])).resolves.toEqual([]);
        });
    });

    describe('getFields', () => {
        it('should return empty array', async () => {
            jest.spyOn(service, 'get').mockResolvedValueOnce([]);
            await expect(service.getFields({} as Auth, 'any string')).resolves.toEqual([]);
        });

        it('should replace address parts', async () => {
            jest.spyOn(service, 'get').mockResolvedValueOnce([
                {
                    code: 'addressField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_addressField',
                        entity: 'CRM_CONTACT_ADDRESS',
                        field: 'addressField',
                        phoneCodes: null,
                        valueType: 'addressType',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                },
                {
                    code: 'addressField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'ADDRESS_1',
                        entity: 'CRM_CONTACT_ADDRESS',
                        field: 'addressField',
                        phoneCodes: null,
                        valueType: 'addressType',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                },
            ]);
            await expect(service.getFields({} as Auth, 'any string')).resolves.toEqual([
                buildFieldDTO({
                    code: 'addressField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'ADDRESS_BX_addressField',
                        entity: 'CRM_CONTACT',
                        field: 'addressField',
                        phoneCodes: null,
                        valueType: 'addressType',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'addressField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'ADDRESS',
                        entity: 'CRM_CONTACT',
                        field: 'addressField',
                        phoneCodes: null,
                        valueType: 'addressType',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
            ]);
        });

        it('should return DTO array', async () => {
            await expect(service.getFields({} as Auth, 'any string')).resolves.toEqual([
                buildFieldDTO({
                    base: true,
                    code: 'CRM_CONTACT',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_baseField',
                        entity: 'CRM_CONTACT',
                        field: 'CRM_CONTACT',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'simpleField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_simpleField',
                        entity: 'CRM_CONTACT',
                        field: 'simpleField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'innerField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_innerField',
                        entity: 'CRM_CONTACT',
                        field: 'innerField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    propertyPath: 'inner.field',
                    type: 'string',
                    base: false,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'arrayField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_arrayField',
                        entity: 'CRM_CONTACT',
                        field: 'arrayField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    propertyPath: 'arrayField[].field',
                    type: 'string',
                    base: false,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'arrayField2',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_arrayField',
                        entity: 'CRM_CONTACT',
                        field: 'arrayField2',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    multiple: true,
                    propertyPath: 'arrayField2[].field',
                    type: 'string',
                    base: false,
                    default: undefined,
                    linkType: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'linkedField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_linkedField',
                        defaultValue: 'by_entity',
                        entity: 'CRM_COMPANY',
                        field: 'linkedField',
                        phoneCodes: null,
                        valueType: null,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'listField',
                    match: {
                        childCode: 'BX_listField_childCode',
                        childId: 'BX_listId',
                        childType: 'CRM_LIST',
                        code: 'BX_listField',
                        defaultValue: 'by_childType',
                        entity: 'CRM_CONTACT',
                        field: 'listField',
                        phoneCodes: null,
                        valueType: null,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'spField',
                    match: {
                        childCode: 'BX_spField_childCode',
                        childId: 'BX_spId',
                        childType: 'CRM_',
                        code: 'BX_spField',
                        entity: 'CRM_CONTACT',
                        field: 'spField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'addressField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'ADDRESS_BX_addressField',
                        entity: 'CRM_CONTACT',
                        field: 'addressField',
                        phoneCodes: null,
                        valueType: 'addressType',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'workPhoneField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'PHONE',
                        entity: 'CRM_CONTACT',
                        field: 'workPhoneField',
                        phoneCodes: null,
                        valueType: 'workPhone',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'faxPhoneField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'PHONE',
                        entity: 'CRM_CONTACT',
                        field: 'faxPhoneField',
                        phoneCodes: null,
                        valueType: 'faxPhone',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'emailField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'EMAIL',
                        entity: 'CRM_CONTACT',
                        field: 'emailField',
                        phoneCodes: null,
                        valueType: 'email',
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'fieldWithDefault',
                    linkType: 'USER',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_fieldWithDefault',
                        defaultValue: 'by_linkType',
                        entity: 'CRM_CONTACT',
                        field: 'fieldWithDefault',
                        phoneCodes: null,
                        valueType: null,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'noMatchField',
                    default: 'defaultWhenNoMatch',
                    match: null,
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'dateField',
                    default: 'invalidDateDefault',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_dateField',
                        entity: 'CRM_CONTACT',
                        field: 'dateField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'date',
                    base: false,
                    propertyPath: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'datetimeField',
                    default: 'invalidDateDefault',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_datetimeField',
                        entity: 'CRM_CONTACT',
                        field: 'datetimeField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'datetime',
                    base: false,
                    propertyPath: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'incorrectDateField',
                    default: 'invalidDateDefault',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_incorrectDateField',
                        entity: 'CRM_CONTACT',
                        field: 'incorrectDateField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'date',
                    base: false,
                    propertyPath: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'emptyField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_emptyField',
                        entity: 'CRM_CONTACT',
                        field: 'emptyField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'missingField',
                    match: {
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'BX_missingField',
                        entity: 'CRM_CONTACT',
                        field: 'missingField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                }),
                buildFieldDTO({
                    code: 'erroredField',
                    match: {
                        childCode: null,
                        childId: 'status_id',
                        childType: null,
                        code: 'BX_erroredField',
                        entity: 'CRM_STATUS',
                        field: 'erroredField',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: undefined,
                    },
                    type: 'string',
                    base: false,
                    propertyPath: undefined,
                    default: undefined,
                    linkType: undefined,
                    multiple: undefined,
                    hint: undefined,
                })
            ]);
        });
    });

    describe('saveFields', () => {
        it('should remove existing and save new', async () => {
            const saveMock = jest.spyOn(service as any, 'save');
            await service.saveFields({} as Auth, '', [
                buildMatchDTO({
                    childCode: null,
                    childId: null,
                    childType: null,
                    code: 'fieldMatch',
                    entity: 'CRM_',
                    field: 'field1',
                    phoneCodes: undefined,
                    valueType: undefined,
                    defaultValue: undefined,
                    defaultView: undefined,
                    defaultPhoneCode: undefined,
                }),
                buildMatchDTO({
                    childCode: null,
                    childId: null,
                    childType: null,
                    code: 'fieldMatch',
                    entity: undefined,
                    field: 'field4',
                    phoneCodes: undefined,
                    valueType: undefined,
                    defaultValue: undefined,
                    defaultView: undefined,
                    defaultPhoneCode: undefined,
                }),
                buildMatchDTO({
                    childCode: null,
                    childId: null,
                    childType: null,
                    code: undefined,
                    entity: 'CRM_',
                    field: 'field5',
                    phoneCodes: undefined,
                    valueType: undefined,
                    defaultValue: undefined,
                    defaultView: undefined,
                    defaultPhoneCode: undefined,
                }),
                buildMatchDTO({
                    childCode: 'childCodeMatch',
                    childId: 'childIdMatch',
                    childType: 'childTypeMatch',
                    code: 'fieldMatch',
                    entity: 'CRM_',
                    field: 'field2',
                    phoneCodes: ['phoneCodes1', 'phoneCodes2'],
                    valueType: 'valueTypeMatch',
                    defaultValue: 'defaultValueMatch',
                    defaultView: 'defaultViewMatch',
                    defaultPhoneCode: 'defaultPhoneCodeMatch',
                }),
            ]);

            expect(saveMock).toHaveBeenCalledWith(
                {},
                [
                    {
                        id: 2,
                        entity: BX_ENTITY.CONTACT,
                        code: 'field',
                        phoneCodes: null,
                        defaultPhoneCode: null,
                        apiField: { base: false } as ApiField,
                        authId: 1,
                        auth: null,
                    },
                ],
                [
                    {
                        apiField: {
                            base: false,
                            code: 'field1',
                            type: 'string',
                        },
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'fieldMatch',
                        entity: 'CRM_',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: null,
                        defaultView: null,
                        defaultPhoneCode: null,
                        auth: {},
                    },
                    {
                        apiField: {
                            base: false,
                            code: 'field2',
                            type: 'string',
                        },
                        childCode: 'childCodeMatch',
                        childId: 'childIdMatch',
                        childType: 'childTypeMatch',
                        code: 'fieldMatch',
                        entity: 'CRM_',
                        phoneCodes: 'phoneCodes1,phoneCodes2',
                        valueType: 'valueTypeMatch',
                        defaultValue: 'defaultValueMatch',
                        defaultView: 'defaultViewMatch',
                        defaultPhoneCode: 'defaultPhoneCodeMatch',
                        auth: {},
                    },
                ],
            );

            expect(qr_startTransaction).toHaveBeenCalled();
            expect(qr_remove).toHaveBeenCalled();
            expect(qr_save).toHaveBeenCalled();
            expect(qr_commitTransaction).toHaveBeenCalled();
            expect(qr_rollbackTransaction).not.toBeCalled();
            expect(qr_release).toHaveBeenCalledAfter(qr_commitTransaction);
        });

        it('should remove all except base', async () => {
            const saveMock = jest.spyOn(service as any, 'save');
            await service.saveFields({} as Auth, '', []);
            expect(saveMock).toHaveBeenCalledWith(
                {},
                [
                    {
                        id: 2,
                        entity: BX_ENTITY.CONTACT,
                        code: 'field',
                        phoneCodes: null,
                        defaultPhoneCode: null,
                        apiField: { base: false } as ApiField,
                        authId: 1,
                        auth: null,
                    },
                ],
                [],
            );

            expect(qr_startTransaction).toHaveBeenCalled();
            expect(qr_remove).toHaveBeenCalled();
            expect(qr_save).toHaveBeenCalled();
            expect(qr_commitTransaction).toHaveBeenCalled();
            expect(qr_rollbackTransaction).not.toBeCalled();
            expect(qr_release).toHaveBeenCalledAfter(qr_commitTransaction);
        });

        it('should update SP base childId', async () => {
            const saveMock = jest.spyOn(service as any, 'save');
            await service.saveFields({} as Auth, '', [
                buildMatchDTO({
                    childCode: 'childCodeMatch',
                    childId: 'childIdMatch',
                    childType: null,
                    code: 'fieldMatch',
                    entity: 'CRM_',
                    field: 'base',
                    phoneCodes: ['phoneCodes1', 'phoneCodes2'],
                    valueType: 'valueTypeMatch',
                    defaultValue: 'defaultValueMatch',
                    defaultView: 'defaultViewMatch',
                    defaultPhoneCode: 'defaultPhoneCodeMatch',
                }),
            ]);

            expect(saveMock).toHaveBeenCalledWith(
                {},
                [
                    {
                        id: 2,
                        entity: BX_ENTITY.CONTACT,
                        code: 'field',
                        phoneCodes: null,
                        defaultPhoneCode: null,
                        apiField: { base: false } as ApiField,
                        authId: 1,
                        auth: null,
                    },
                ],
                [
                    {
                        id: 1,
                        apiField: {
                            base: true,
                        },
                        childCode: undefined,
                        childId: 'childIdMatch',
                        childType: undefined,
                        code: 'base',
                        entity: 'CRM_',
                        phoneCodes: null,
                        valueType: undefined,
                        defaultValue: undefined,
                        defaultView: undefined,
                        defaultPhoneCode: null,
                        auth: null,
                        authId: 1,
                    },
                ],
            );
        });

        it('should not update not SP base childId', async () => {
            const saveMock = jest.spyOn(service as any, 'save');

            await service.saveFields({} as Auth, '', [
                buildMatchDTO({
                    childCode: 'childCodeMatch',
                    childId: 'childIdMatch',
                    childType: null,
                    code: 'fieldMatch',
                    entity: 'any string',
                    field: 'base',
                    phoneCodes: ['phoneCodes1', 'phoneCodes2'],
                    valueType: 'valueTypeMatch',
                    defaultValue: 'defaultValueMatch',
                    defaultView: 'defaultViewMatch',
                    defaultPhoneCode: 'defaultPhoneCodeMatch',
                }),
            ]);

            expect(saveMock).toHaveBeenCalledWith(
                {},
                [
                    {
                        id: 2,
                        entity: BX_ENTITY.CONTACT,
                        code: 'field',
                        phoneCodes: null,
                        defaultPhoneCode: null,
                        apiField: { base: false } as ApiField,
                        authId: 1,
                        auth: null,
                    },
                ],
                [],
            );
        });

        it('should replace address parts', async () => {
            const saveMock = jest.spyOn(service as any, 'save');
            await service.saveFields({} as Auth, '', [
                buildMatchDTO({
                    childCode: null,
                    childId: null,
                    childType: null,
                    code: 'ADDRESS_any string',
                    entity: 'any',
                    field: 'field1',
                    phoneCodes: undefined,
                    valueType: undefined,
                    defaultValue: undefined,
                    defaultView: undefined,
                    defaultPhoneCode: undefined,
                }),
                buildMatchDTO({
                    childCode: null,
                    childId: null,
                    childType: null,
                    code: 'ADDRESS',
                    entity: 'any',
                    field: 'field2',
                    phoneCodes: undefined,
                    valueType: undefined,
                    defaultValue: undefined,
                    defaultView: undefined,
                    defaultPhoneCode: undefined,
                }),
                buildMatchDTO({
                    childCode: null,
                    childId: null,
                    childType: null,
                    code: 'ADDRESS_ADDRESS',
                    entity: 'any',
                    field: 'field3',
                    phoneCodes: undefined,
                    valueType: undefined,
                    defaultValue: undefined,
                    defaultView: undefined,
                    defaultPhoneCode: undefined,
                }),
            ]);

            expect(saveMock).toHaveBeenCalledWith(
                {},
                [
                    {
                        id: 2,
                        entity: BX_ENTITY.CONTACT,
                        code: 'field',
                        phoneCodes: null,
                        defaultPhoneCode: null,
                        apiField: { base: false } as ApiField,
                        authId: 1,
                        auth: null,
                    },
                ],
                [
                    {
                        apiField: {
                            base: false,
                            code: 'field1',
                            type: 'string',
                        },
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'any string',
                        entity: 'any_ADDRESS',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: null,
                        defaultView: null,
                        defaultPhoneCode: null,
                        auth: {},
                    },
                    {
                        apiField: {
                            base: false,
                            code: 'field2',
                            type: 'string',
                        },
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'ADDRESS_1',
                        entity: 'any_ADDRESS',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: null,
                        defaultView: null,
                        defaultPhoneCode: null,
                        auth: {},
                    },
                    {
                        apiField: {
                            base: false,
                            code: 'field3',
                            type: 'string',
                        },
                        childCode: null,
                        childId: null,
                        childType: null,
                        code: 'ADDRESS_1',
                        entity: 'any_ADDRESS',
                        phoneCodes: null,
                        valueType: null,
                        defaultValue: null,
                        defaultView: null,
                        defaultPhoneCode: null,
                        auth: {},
                    },
                ],
            );
        });

        it('should roll back on remove fields error', async () => {
            qr_remove.mockImplementationOnce(() => {
                throw 'error';
            });

            await expect(service.saveFields({} as Auth, '', [])).rejects.toThrowError(InternalServerErrorException);

            expect(qr_startTransaction).toHaveBeenCalled();
            expect(qr_remove).toHaveBeenCalled();
            expect(qr_save).not.toBeCalled();
            expect(qr_commitTransaction).not.toBeCalled();
            expect(qr_rollbackTransaction).toHaveBeenCalled();
            expect(qr_release).toHaveBeenCalledAfter(qr_rollbackTransaction);
        });

        it('should roll back on save fields error', async () => {
            qr_save.mockImplementationOnce(() => {
                throw 'error';
            });

            await expect(service.saveFields({} as Auth, '', [])).rejects.toThrowError(InternalServerErrorException);

            expect(qr_startTransaction).toHaveBeenCalled();
            expect(qr_remove).toHaveBeenCalled();
            expect(qr_save).toHaveBeenCalled();
            expect(qr_commitTransaction).not.toBeCalled();
            expect(qr_rollbackTransaction).toHaveBeenCalled();
            expect(qr_release).toHaveBeenCalledAfter(qr_rollbackTransaction);
        });
    });

    describe('initiateMatching', () => {
        it('should do nothing if all base fields matched', async () => {
            jest.spyOn(mockedMatchingRepo, 'count').mockImplementationOnce(() => 42);
            qb_getMany.mockImplementationOnce(() => [
                {
                    matching: [{}],
                },
                {
                    matching: [{}],
                },
            ]);
            const saveMock = jest.spyOn(service as any, 'save');
            await service.initiateMatching({} as Auth);
            expect(saveMock).not.toBeCalled();
        });

        it('should generate default matching if no matches found', async () => {
            jest.spyOn(mockedDefaultMatchingRepo, 'find').mockImplementationOnce(() => [
                {
                    id: 1,
                    entity: 'entity1',
                    code: 'code1',
                    apiField: { id: 11 } as ApiField,
                    apiFieldId: 11,
                },
                {
                    id: 2,
                    entity: 'entity2',
                    code: 'code2',
                    apiField: { id: 12 } as ApiField,
                    apiFieldId: 12,
                },
                {
                    id: 3,
                    entity: 'entity3',
                    code: 'code3',
                    apiField: { id: 13 } as ApiField,
                    apiFieldId: 13,
                    valueType: 'valueTypeDefault',
                },
            ]);
            const saveMock = jest.spyOn(service as any, 'save');
            await service.initiateMatching({} as Auth);
            expect(saveMock).toHaveBeenCalledWith(
                {},
                [],
                [
                    {
                        apiField: {
                            code: 'noMatchField',
                            default: 'defaultWhenNoMatch',
                            type: 'string',
                        },
                        auth: {},
                        code: 'ID',
                        entity: 'defaultWhenNoMatch',
                    },
                    {
                        apiField: { id: 11 },
                        auth: {},
                        code: 'code1',
                        entity: 'entity1',
                        valueType: undefined,
                    },
                    {
                        apiField: { id: 12 },
                        auth: {},
                        code: 'code2',
                        entity: 'entity2',
                        valueType: undefined,
                    },
                    {
                        apiField: { id: 13 },
                        auth: {},
                        code: 'code3',
                        entity: 'entity3',
                        valueType: 'valueTypeDefault',
                    },
                ],
            );
        });

        it('should add missing base matching if matches found', async () => {
            jest.spyOn(mockedMatchingRepo, 'count').mockImplementationOnce(() => 42);
            qb_getMany.mockImplementationOnce(() => [
                {
                    id: 1,
                    matching: [{}],
                },
                {
                    id: 2,
                    default: 'entity',
                },
                {
                    id: 3,
                    default: BX_ENTITY.SMART_PROCESS,
                },
            ]);
            const saveMock = jest.spyOn(service as any, 'save');
            await service.initiateMatching({} as Auth);
            expect(saveMock).toHaveBeenCalledWith(
                {},
                [],
                [
                    {
                        apiField: { id: 2, default: 'entity' },
                        auth: {},
                        code: 'ID',
                        entity: 'entity',
                        valueType: undefined,
                    },
                    {
                        apiField: { id: 3, default: BX_ENTITY.SMART_PROCESS },
                        auth: {},
                        code: 'id',
                        entity: BX_ENTITY.SMART_PROCESS,
                        valueType: undefined,
                    },
                ],
            );
        });

        it('should throw error', async () => {
            jest.spyOn(mockedDefaultMatchingRepo, 'find').mockImplementationOnce(() => [
                {
                    id: 1,
                    entity: 'entity1',
                    code: 'code1',
                    apiField: { id: 11 } as ApiField,
                    apiFieldId: 11,
                },
            ]);
            qr_save.mockImplementationOnce(() => {
                throw 'error';
            });
            await expect(service.initiateMatching({} as Auth)).rejects.toThrowError(InternalServerErrorException);
        });
    });

    describe('parseResponse', () => {
        it('should set enum value', () => {
            const fields = [
                {
                    code: 'enumField',
                    type: 'enumeration',
                    match: {
                        entity: BX_ENTITY.CONTACT,
                        code: 'BX_enumField',
                    },
                } as FieldDto,
            ];
            const bxResponse = {
                result: {
                    CRM_CONTACT: {
                        BX_enumField: 20,
                    },
                    BX_enumField: {
                        fields: {
                            BX_enumField: {
                                items: [
                                    { ID: 10, VALUE: 'VAL_10' },
                                    { ID: 20, VALUE: 'VAL_20' },
                                    { ID: 30, VALUE: 'VAL_30' },
                                ],
                            },
                        },
                    },
                },
            } as unknown as BxApiResult<any>;
            return expect(MatchingService['parseResponse'](fields, bxResponse)).toEqual({
                enumField: 'VAL_20',
            });
        });

        it('should set undefined enum value', () => {
            const fields = [
                {
                    code: 'enumField',
                    type: 'enumeration',
                    match: {
                        entity: BX_ENTITY.CONTACT,
                        code: 'BX_enumField',
                    },
                } as FieldDto,
            ];
            const bxResponse = {
                result: {
                    CRM_CONTACT: {
                        BX_enumField: 50,
                    },
                    BX_enumField: {
                        fields: {
                            BX_enumField: {
                                items: [
                                    { ID: 10, VALUE: 'VAL_10' },
                                    { ID: 20, VALUE: 'VAL_20' },
                                    { ID: 30, VALUE: 'VAL_30' },
                                ],
                            },
                        },
                    },
                },
            } as unknown as BxApiResult<any>;
            return expect(MatchingService['parseResponse'](fields, bxResponse)).toEqual({
                enumField: undefined,
            });
        });

        it('should set boolean value', () => {
            const fields = [
                {
                    code: 'bool_Y',
                    type: 'boolean',
                    match: {
                        entity: BX_ENTITY.CONTACT,
                        code: 'BX_Y',
                    },
                },
                {
                    code: 'bool_1',
                    type: 'boolean',
                    match: {
                        entity: BX_ENTITY.CONTACT,
                        code: 'BX_1',
                    },
                },
                {
                    code: 'bool_N',
                    type: 'boolean',
                    match: {
                        entity: BX_ENTITY.CONTACT,
                        code: 'BX_N',
                    },
                },
                {
                    code: 'bool_0',
                    type: 'boolean',
                    match: {
                        entity: BX_ENTITY.CONTACT,
                        code: 'BX_0',
                    },
                },
            ] as FieldDto[];
            const bxResponse = {
                result: {
                    CRM_CONTACT: {
                        BX_Y: 'Y',
                        BX_N: 'N',
                        BX_1: '1',
                        BX_0: '0',
                    },
                },
            } as unknown as BxApiResult<any>;
            return expect(MatchingService['parseResponse'](fields, bxResponse)).toEqual({
                bool_Y: expect.toBeTrue(),
                bool_1: expect.toBeTrue(),
                bool_N: expect.toBeFalse(),
                bool_0: expect.toBeFalse(),
            });
        });
    });
});
