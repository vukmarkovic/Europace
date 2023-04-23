import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import { AuthService } from '../../../src/common/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import BxApiResult from '../../../src/modules/bxapi/models/bx.api.result';
import axios from 'axios';

jest.mock('@nestjs/common/services/logger.service');
jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;
axios.post = jest.fn().mockReturnThis();
axios.get = jest.fn().mockReturnThis();
axios.create = jest.fn().mockReturnThis();
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
    refresh_token: 'old_refresh',
    auth_token: 'auth_token',
    active: true,
} as Auth;
const authServiceMock = {
    getByDomain: () => authMock,
    save: jest.fn().mockReturnThis(),
};
const configMock = {
    get: (val) => {
        return {
            CLIENT_ID: 'client_id',
            CLIENT_SECRET: 'client_secret',
        }[val];
    },
};

describe('BxApiService', () => {
    let service: BxApiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BxApiService,
                ErrorHandler,
                {
                    provide: AuthService,
                    useValue: authServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configMock,
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
        service = await module.get<BxApiService>(BxApiService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAuth', () => {
        it('should return auth', async () => {
            const refreshMock = jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
            await expect(service.getAuth('domain')).resolves.toEqual(authMock);
            expect(refreshMock).toHaveBeenCalledWith(authMock);
        });
    });

    describe('getActiveAuth', () => {
        it('should return auth', async () => {
            jest.spyOn(service, 'getAuth').mockReturnValueOnce(Promise.resolve(authMock));
            await expect(service.getActiveAuth('domain')).resolves.toEqual(authMock);
        });

        it('should return null', async () => {
            jest.spyOn(service, 'getAuth')
                .mockReturnValueOnce(Promise.resolve({ ...authMock, active: false }))
                .mockImplementationOnce(() => {
                    throw 'error';
                });
            await expect(service.getActiveAuth('domain')).resolves.toEqual(null);
            await expect(service.getActiveAuth('domain')).resolves.toEqual(null);
        });
    });

    describe('excludeFileContent', () => {
        it('should return true', () => {
            expect(BxApiService['excludeFileContent']([])).toEqual([[], true]);
            expect(BxApiService['excludeFileContent']([{ method: 'any', data: {} }])).toEqual([[{ method: 'any', data: {} }], true]);
            expect(BxApiService['excludeFileContent']([{ method: 'any', data: { key: 'value' } }])).toEqual([
                [{ method: 'any', data: { key: 'value' } }],
                true,
            ]);
        });

        it('should return false', () => {
            expect(BxApiService['excludeFileContent']([{ method: 'any', data: { key: 'value', fileContent: 'value' } }])).toEqual([
                [{ method: 'any', data: { key: 'value' } }],
                false,
            ]);
        });
    });

    describe('normalizeFileNameName', () => {
        it('should throw error', () => {
            expect(() => BxApiService['normalizeFileNameName'](null)).toThrowWithMessage(Error, '{}');
        });

        it('should return unchanged string', () => {
            expect(BxApiService['normalizeFileNameName']('12890-=asdfdfg_@$%')).toEqual('12890-=asdfdfg_@$%');
        });

        it('should return clean string', () => {
            expect(BxApiService['normalizeFileNameName']('1№2#3;4:5')).toEqual('1_2_3_4_5');
        });
    });

    describe('createSubFolder', () => {
        it('should return null', () => {
            const result = new BxApiResult();
            result.error = 'error';
            jest.spyOn(service, 'callBXApi').mockReturnValueOnce(Promise.resolve(result));
            return expect(service.createSubFolder(authMock, { id: '42', data: { NAME: 'name' } })).resolves.toBeNull();
        });

        it('should return ID', async () => {
            const result = new BxApiResult();
            result.data = { ID: '42' };
            const bxMock = jest.spyOn(service, 'callBXApi').mockReturnValueOnce(Promise.resolve(result));
            await expect(service.createSubFolder(authMock, { id: '24', data: { NAME: 'name' } })).resolves.toEqual('42');

            expect(bxMock).toHaveBeenCalledWith(authMock, {
                method: 'disk.folder.addsubfolder',
                data: {
                    id: '24',
                    data: {
                        NAME: 'name',
                    },
                },
            });
        });
    });

    describe('getFolderId', () => {
        it('should return null', () => {
            const result = new BxApiResult();
            result.error = 'error';
            jest.spyOn(service, 'callBXApi').mockReturnValueOnce(Promise.resolve(result));
            return expect(service.getFolderId(authMock, '42', 'name')).resolves.toBeNull();
        });

        it('should return ID', async () => {
            const result = new BxApiResult();
            result.data = [{ ID: '42' }];
            const bxMock = jest.spyOn(service, 'callBXApi').mockReturnValueOnce(Promise.resolve(result));
            await expect(service.getFolderId(authMock, '24', 'name')).resolves.toEqual('42');

            expect(bxMock).toHaveBeenCalledWith(authMock, {
                method: 'disk.folder.getchildren',
                data: {
                    id: '24',
                    filter: {
                        NAME: 'name',
                    },
                },
            });
        });
    });

    describe('getSubFolderId', () => {
        it('should return existing folder id', async () => {
            const findMock = jest.spyOn(service, 'getFolderId').mockReturnValueOnce(Promise.resolve('42'));
            const createMock = jest.spyOn(service, 'createSubFolder').mockReturnValueOnce(Promise.resolve('24'));

            await expect(service.getSubFolderId(authMock, { id: '42', data: { NAME: 'name' } })).resolves.toEqual('42');
            expect(findMock).toHaveBeenCalledWith(authMock, '42', 'name');
            expect(createMock).not.toBeCalled();
        });

        it('should create new folder', async () => {
            const findMock = jest.spyOn(service, 'getFolderId').mockReturnValueOnce(Promise.resolve(null));
            const createMock = jest.spyOn(service, 'createSubFolder').mockReturnValueOnce(Promise.resolve('24'));

            await expect(service.getSubFolderId(authMock, { id: '42', data: { NAME: 'name' } })).resolves.toEqual('24');
            expect(findMock).toHaveBeenCalledWith(authMock, '42', 'name');
            expect(createMock).toHaveBeenCalledWith(authMock, { id: '42', data: { NAME: 'name' } });
        });
    });

    describe('getQuery', () => {
        it('should return empty string', () => {
            expect(service['getQuery'](null)).toEqual('');
            expect(service['getQuery'](null, 'any')).toEqual('');
        });

        it('should stringify value', () => {
            expect(service['getQuery']('')).toEqual('&{0}=');
            expect(service['getQuery']('string')).toEqual('&{0}=string');
            expect(service['getQuery'](42, 'path')).toEqual('&path=42');
            expect(service['getQuery'](true, 'path[{0}]')).toEqual('&path=true');
        });

        it('should stringify object', () => {
            expect(
                service['getQuery']({
                    obj: {
                        inner1: {
                            str: 'string',
                            number: 42,
                        },
                        inner2: {
                            bool: false,
                            date: new Date('2022-01-02T03:04:05+06:00'),
                        },
                    },
                }),
            ).toEqual('&obj[inner1][str]=string&obj[inner1][number]=42&obj[inner2][bool]=false&obj[inner2][date]=2022-01-01T21%3A04%3A05.000Z');
        });
    });

    describe('getMap', () => {
        it('should return empty', async () => {
            const listMock = jest.spyOn(service, 'getList');
            await expect(service.getMap(authMock, 'method', 'filterField', [])).resolves.toEqual({});
            expect(listMock).not.toBeCalled();
        });

        it('should return base map', async () => {
            const result = new BxApiResult<unknown[]>();
            result.data = [
                { id: 1, filterField: '1' },
                { id: 2, filterField: '2' },
            ];
            const listMock = jest.spyOn(service, 'getList').mockReturnValueOnce(Promise.resolve(result));
            await expect(service.getMap(authMock, 'method', 'filterField', ['1', '2', '3'], [], '42')).resolves.toEqual({
                1: { id: 1, filterField: '1' },
                2: { id: 2, filterField: '2' },
            });

            expect(listMock).toHaveBeenCalledWith(authMock, {
                method: 'method',
                data: {
                    select: ['id', 'filterField'],
                    filter: { ['=filterField']: ['1', '2', '3'] },
                    entityTypeId: '42',
                },
            });
        });

        it('should return extended map', async () => {
            const result = new BxApiResult<unknown[]>();
            result.data = [
                { id: 1, filterField: '1', auxField1: 'au1_1', auxField2: 'au1_2' },
                { id: 2, filterField: '2', auxField1: 'au2_1', auxField2: 'au2_2' },
            ];
            const listMock = jest.spyOn(service, 'getList').mockReturnValueOnce(Promise.resolve(result));
            await expect(service.getMap(authMock, 'method', 'filterField', ['1', '2', '3'], ['auxField1', 'auxField2'])).resolves.toEqual({
                1: { id: 1, filterField: '1', auxField1: 'au1_1', auxField2: 'au1_2' },
                2: { id: 2, filterField: '2', auxField1: 'au2_1', auxField2: 'au2_2' },
            });

            expect(listMock).toHaveBeenCalledWith(authMock, {
                method: 'method',
                data: {
                    select: ['ID', 'filterField', 'auxField1', 'auxField2'],
                    filter: { ['=filterField']: ['1', '2', '3'] },
                },
            });
        });
    });

    describe('getCRMMap', () => {
        it('should call simple map', async () => {
            const mapMock = jest.spyOn(service, 'getMap').mockReturnValueOnce(Promise.resolve({})).mockReturnValueOnce(Promise.resolve({}));

            await expect(service.getCRMMap(authMock, 'entity', 'filterField', [], '42'));
            await expect(service.getCRMMap(authMock, 'entity', 'filterField', []));
            expect(mapMock).toHaveBeenNthCalledWith(1, authMock, 'crm.entity.list', 'filterField', [], [], '42');
            expect(mapMock).toHaveBeenNthCalledWith(2, authMock, 'crm.entity.list', 'filterField', [], [], undefined);
        });

        it('should call extended map', async () => {
            const mapMock = jest.spyOn(service, 'getMap').mockReturnValueOnce(Promise.resolve({})).mockReturnValueOnce(Promise.resolve({}));

            await expect(service.getCRMMap(authMock, 'entity', 'filterField', [], ['aux'], '42'));
            await expect(service.getCRMMap(authMock, 'entity', 'filterField', [], ['aux']));
            expect(mapMock).toHaveBeenNthCalledWith(1, authMock, 'crm.entity.list', 'filterField', [], ['aux'], '42');
            expect(mapMock).toHaveBeenNthCalledWith(2, authMock, 'crm.entity.list', 'filterField', [], ['aux'], undefined);
        });
    });

    describe('getCurrentUser', () => {
        it('should call for current user', async () => {
            const callMock = jest.spyOn(service, 'callBXApi').mockReturnValueOnce(Promise.resolve(new BxApiResult()));
            await expect(service.getCurrentUser(authMock)).toResolve();
            expect(callMock).toBeCalledWith(authMock, { method: 'user.current', data: {} });
        });
    });

    describe('getScopes', () => {
        it('should call for scopes', async () => {
            const callMock = jest.spyOn(service, 'callBXApi').mockReturnValueOnce(Promise.resolve(new BxApiResult()));
            await expect(service.getScopes(authMock)).toResolve();
            expect(callMock).toBeCalledWith(authMock, { method: 'scope', data: {} });
        });
    });

    describe('refreshAuth', () => {
        it('should return', async () => {
            const auth = { ...authMock, expires: new Date().getTime() + 1000 };
            await expect(service.refreshAuth(auth)).resolves.toEqual(auth);
            expect(authServiceMock.save).not.toBeCalled();
        });

        it('should refresh', async () => {
            const auth = { ...authMock, expires: new Date().getTime() - 1000 };
            const getMock = jest.spyOn(service['AUTH_API'], 'get').mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        access_token: 'access',
                        refresh_token: 'refresh',
                        expires: 12345,
                    },
                }),
            );

            await expect(service.refreshAuth(auth)).resolves.toEqual({
                ...auth,
                auth_token: 'access',
                refresh_token: 'refresh',
                expires: 12345000,
            });
            expect(getMock).toHaveBeenCalledWith('', {
                params: {
                    client_id: 'client_id',
                    client_secret: 'client_secret',
                    refresh_token: 'old_refresh',
                },
            });
        });
    });

    describe('callBXApi', () => {
        beforeEach(() => {
            jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
        });

        it('should return data', async () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        result: 'some result',
                    },
                }),
            );
            const expected = new BxApiResult();
            expected.data = 'some result';

            await expect(
                service.callBXApi(authMock, {
                    id: 'callId',
                    method: 'someMethod',
                    data: {
                        key: 'value',
                    },
                }),
            ).resolves.toEqual(expected);

            expect(axiosMock.post).toHaveBeenCalledWith('https://domain.test/rest/someMethod.json', {
                key: 'value',
                auth: 'auth_token',
                start: -1,
            });
        });

        it('should return error', async () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        error: 'some error',
                    },
                }),
            );
            const expected = new BxApiResult();
            expected.error = 'some error';

            await expect(
                service.callBXApi(authMock, {
                    id: 'callId',
                    method: 'someMethod',
                    data: {
                        key: 'value',
                    },
                }),
            ).resolves.toEqual(expected);

            expect(axiosMock.post).toHaveBeenCalledWith('https://domain.test/rest/someMethod.json', {
                key: 'value',
                auth: 'auth_token',
                start: -1,
            });
        });

        it('should throw error', () => {
            axiosMock.post.mockImplementationOnce(() => {
                throw new Error('error');
            });
            return expect(service.callBXApi(authMock, { method: 'method', data: {} })).rejects.toThrowWithMessage(Error, 'error');
        });
    });

    describe('getList', () => {
        beforeEach(() => {
            jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
        });

        it('should throw error', async () => {
            axiosMock.post.mockImplementationOnce(() => {
                throw new Error('error');
            });
            await expect(service.getList(authMock, { method: 'list', data: {} })).rejects.toThrowWithMessage(Error, 'error');
            await expect(service.getList(authMock, { method: 'method', data: {} })).rejects.toThrowWithMessage(Error, 'Trying to list non-list method: method');
        });

        it('should use filter property', async () => {
            jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
            axiosMock.post
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            error: 'some error',
                        },
                    }),
                )
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            error: 'some error',
                        },
                    }),
                );
            await expect(service.getList(authMock, { method: 'list', data: {} })).toResolve();
            await expect(service.getList(authMock, { method: 'list', data: { filter: {} } })).toResolve();
            expect(axiosMock.post).toHaveBeenCalledWith(`https://domain.test/rest/list.json`, {
                filter: {
                    '>ID': 0,
                },
                auth: 'auth_token',
                start: -1,
                order: {
                    ID: 'ASC',
                },
            });
        });

        it('should use FILTER property', async () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        error: 'some error',
                    },
                }),
            );
            await expect(service.getList(authMock, { method: 'list', data: { FILTER: {} } })).toResolve();
            expect(axiosMock.post).toHaveBeenCalledWith(`https://domain.test/rest/list.json`, {
                FILTER: {
                    '>ID': 0,
                },
                auth: 'auth_token',
                start: -1,
                order: {
                    ID: 'ASC',
                },
            });
        });

        it('should use id property', async () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        error: 'some error',
                    },
                }),
            );
            await expect(service.getList(authMock, { method: 'crm.item.get', data: { FILTER: {} } })).toResolve();
            expect(axiosMock.post).toHaveBeenCalledWith(`https://domain.test/rest/crm.item.get.json`, {
                FILTER: {
                    '>id': 0,
                },
                auth: 'auth_token',
                start: -1,
                order: {
                    id: 'ASC',
                },
            });
        });

        it('should use ID property', async () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        error: 'some error',
                    },
                }),
            );
            await expect(service.getList(authMock, { method: 'list', data: { FILTER: {} } })).toResolve();
            expect(axiosMock.post).toHaveBeenCalledWith(`https://domain.test/rest/list.json`, {
                FILTER: {
                    '>ID': 0,
                },
                auth: 'auth_token',
                start: -1,
                order: {
                    ID: 'ASC',
                },
            });
        });

        it('should return items', async () => {
            const refreshMock = jest.spyOn(service, 'refreshAuth');
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        result: {
                            items: [1, 2, 3],
                        },
                    },
                }),
            );
            await expect(service.getList(authMock, { method: 'list', data: { FILTER: {} } })).resolves.toEqual({ errors: {}, result: { single: [1, 2, 3] } });
            expect(refreshMock).toHaveBeenCalledOnce();
        });

        it('should return types', async () => {
            const refreshMock = jest.spyOn(service, 'refreshAuth');
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        result: {
                            types: [1, 2, 3],
                        },
                    },
                }),
            );
            await expect(service.getList(authMock, { method: 'list', data: { FILTER: {} } })).resolves.toEqual({ errors: {}, result: { single: [1, 2, 3] } });
            expect(refreshMock).toHaveBeenCalledOnce();
        });

        it('should return result', async () => {
            const refreshMock = jest.spyOn(service, 'refreshAuth');
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        result: [1, 2, 3],
                    },
                }),
            );
            await expect(service.getList(authMock, { method: 'list', data: { FILTER: {} } })).resolves.toEqual({ errors: {}, result: { single: [1, 2, 3] } });
            expect(refreshMock).toHaveBeenCalledOnce();
        });

        it('should call for more', async () => {
            const refreshMock = jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
            axiosMock.post
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            result: [
                                1,
                                2,
                                3,
                                4,
                                5,
                                6,
                                7,
                                8,
                                9,
                                10,
                                11,
                                12,
                                13,
                                14,
                                15,
                                16,
                                17,
                                18,
                                19,
                                20,
                                21,
                                22,
                                23,
                                24,
                                25,
                                26,
                                27,
                                28,
                                29,
                                30,
                                31,
                                32,
                                33,
                                34,
                                35,
                                36,
                                37,
                                38,
                                39,
                                40,
                                41,
                                42,
                                43,
                                44,
                                45,
                                46,
                                47,
                                48,
                                49,
                                { ID: 50 }, //only last element is correct object for space economy
                            ],
                        },
                    }),
                )
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            result: [1, 2, 3],
                        },
                    }),
                );
            await expect(service.getList(authMock, { method: 'list', data: { FILTER: {} } })).resolves.toEqual({
                errors: {},
                result: {
                    single: [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        14,
                        15,
                        16,
                        17,
                        18,
                        19,
                        20,
                        21,
                        22,
                        23,
                        24,
                        25,
                        26,
                        27,
                        28,
                        29,
                        30,
                        31,
                        32,
                        33,
                        34,
                        35,
                        36,
                        37,
                        38,
                        39,
                        40,
                        41,
                        42,
                        43,
                        44,
                        45,
                        46,
                        47,
                        48,
                        49,
                        { ID: 50 },
                        1,
                        2,
                        3,
                    ],
                },
            });
            expect(refreshMock).toHaveBeenCalledTimes(2);
            expect(axiosMock.post).toHaveBeenCalledTimes(2);
            expect(axiosMock.post).toHaveBeenLastCalledWith(`https://domain.test/rest/list.json`, {
                FILTER: {
                    '>ID': 50,
                },
                auth: 'auth_token',
                start: -1,
                order: {
                    ID: 'ASC',
                },
            });
        });

        it('should return error from next call', async () => {
            const refreshMock = jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
            axiosMock.post
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            result: [
                                1,
                                2,
                                3,
                                4,
                                5,
                                6,
                                7,
                                8,
                                9,
                                10,
                                11,
                                12,
                                13,
                                14,
                                15,
                                16,
                                17,
                                18,
                                19,
                                20,
                                21,
                                22,
                                23,
                                24,
                                25,
                                26,
                                27,
                                28,
                                29,
                                30,
                                31,
                                32,
                                33,
                                34,
                                35,
                                36,
                                37,
                                38,
                                39,
                                40,
                                41,
                                42,
                                43,
                                44,
                                45,
                                46,
                                47,
                                48,
                                49,
                                { ID: 50 }, //only last element is correct object for space economy
                            ],
                        },
                    }),
                )
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            error: 'error',
                        },
                    }),
                );
            await expect(service.getList(authMock, { method: 'list', data: { FILTER: {} } })).resolves.toEqual({
                errors: {
                    single: 'error',
                },
                result: {
                    single: [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        14,
                        15,
                        16,
                        17,
                        18,
                        19,
                        20,
                        21,
                        22,
                        23,
                        24,
                        25,
                        26,
                        27,
                        28,
                        29,
                        30,
                        31,
                        32,
                        33,
                        34,
                        35,
                        36,
                        37,
                        38,
                        39,
                        40,
                        41,
                        42,
                        43,
                        44,
                        45,
                        46,
                        47,
                        48,
                        49,
                        { ID: 50 },
                    ],
                },
            });
            expect(refreshMock).toHaveBeenCalledTimes(2);
            expect(axiosMock.post).toHaveBeenCalledTimes(2);
        });
    });

    describe('callBXBatch', () => {
        beforeEach(() => {
            jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
        });

        it('should return empty result', () => {
            return expect(service.callBXBatch(authMock, [])).resolves.toEqual(new BxApiResult());
        });

        it('should execute batch', () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        result: {
                            result: {
                                success: 'success',
                            },
                            result_error: {
                                error: 'error',
                            },
                        },
                    },
                }),
            );

            const expected = new BxApiResult();
            expected.result = { success: 'success' };
            expected.errors = { error: 'error' };
            return expect(service.callBXBatch(authMock, [{ method: 'method', data: {} }])).resolves.toEqual(expected);
        });

        it('should execute huge batch', async () => {
            const refreshMock = jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
            axiosMock.post
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            result: {
                                result: {
                                    success: ['success'],
                                },
                            },
                        },
                    }),
                )
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            result: {
                                result: {
                                    success: ['success'],
                                },
                            },
                        },
                    }),
                );
            const expected = new BxApiResult();
            expected.result = { success: ['success', 'success'] };

            await expect(service.callBXBatch(authMock, Array(51).fill({ method: 'method', data: {} }))).resolves.toEqual(expected);
            expect(axiosMock.post).toHaveBeenCalledTimes(2);
            expect(refreshMock).toHaveBeenCalledTimes(2);
        });

        it('should call for more', async () => {
            const batchMock = jest.spyOn(service, 'callBXBatch');
            const refreshMock = jest.spyOn(service, 'refreshAuth').mockReturnValueOnce(Promise.resolve(authMock));
            axiosMock.post
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            result: {
                                result: {
                                    success: ['success'],
                                },
                                result_next: {
                                    success: 42,
                                },
                            },
                        },
                    }),
                )
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            result: {
                                result: {
                                    success: ['success42'],
                                },
                            },
                        },
                    }),
                );

            const expected = new BxApiResult();
            expected.result = { success: ['success', 'success42'] };

            await expect(service.callBXBatch(authMock, [{ id: 'success', method: 'method', data: {} }])).resolves.toEqual(expected);
            expect(axiosMock.post).toHaveBeenCalledTimes(2);
            expect(refreshMock).toHaveBeenCalledTimes(2);
            expect(batchMock).toHaveBeenCalledTimes(2);
            expect(batchMock).toHaveBeenLastCalledWith(authMock, [{ id: 'success', method: 'method', data: {}, start: 42 }], {
                errors: {},
                result: { success: ['success', 'success42'] },
            });
        });

        it('should throw error', () => {
            axiosMock.post.mockImplementationOnce(() => {
                throw new Error('error');
            });
            return expect(service.callBXBatch(authMock, [{ id: 'success', method: 'method', data: {} }])).rejects.toThrowWithMessage(Error, 'error');
        });
    });
});
