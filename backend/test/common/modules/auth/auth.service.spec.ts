import { ModuleMocker } from 'jest-mock';
import { AuthService } from '../../../../src/common/modules/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Auth } from '../../../../src/common/modules/auth/model/entities/auth.entity';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;
const repoMock = {
    findOne: jest.fn().mockReturnValue(authMock),
    save: jest.fn().mockReturnThis(),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(Auth),
                    useValue: repoMock,
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
        service = await module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getByMemberId', () => {
        it('should return null', async () => {
            await expect(service.getByMemberId('')).resolves.toEqual(null);
            await expect(service.getByMemberId(null)).resolves.toEqual(null);
            await expect(service.getByMemberId(undefined)).resolves.toEqual(null);
        });

        it('should return auth', async () => {
            const getMock = jest.spyOn(AuthService['_CACHE'], 'get');
            const setMock = jest.spyOn(AuthService['_CACHE'], 'set');

            await expect(service.getByMemberId('member_id.test')).resolves.toEqual(authMock);
            expect(getMock).toHaveBeenCalledTimes(2);
            expect(setMock).toHaveBeenCalledTimes(1);
            expect(repoMock.findOne).toHaveBeenCalledTimes(1);
        });

        it('should return cached auth', async () => {
            await service.getByMemberId('member_id.test');
            jest.clearAllMocks();

            const getMock = jest.spyOn(AuthService['_CACHE'], 'get');
            const setMock = jest.spyOn(AuthService['_CACHE'], 'set');
            const findMock = jest.spyOn(service['repository'], 'findOne');

            await expect(service.getByMemberId('member_id.test')).resolves.toEqual(authMock);
            expect(getMock).toHaveBeenCalledTimes(2);
            expect(setMock).not.toHaveBeenCalled();
            expect(findMock).not.toHaveBeenCalled();
        });
    });

    describe('getByDomain', () => {
        it('should return null', async () => {
            await expect(service.getByDomain('')).resolves.toEqual(null);
            await expect(service.getByDomain(null)).resolves.toEqual(null);
            await expect(service.getByDomain(undefined)).resolves.toEqual(null);
        });

        it('should return auth', async () => {
            const getMock = jest.spyOn(AuthService['_CACHE'], 'get');
            const setMock = jest.spyOn(AuthService['_CACHE'], 'set');

            await expect(service.getByDomain('domain.test')).resolves.toEqual(authMock);
            expect(getMock).toHaveBeenCalledTimes(2);
            expect(setMock).toHaveBeenCalledTimes(1);
            expect(repoMock.findOne).toHaveBeenCalledTimes(1);
        });

        it('should return cached auth', async () => {
            await service.getByDomain('domain.test');
            jest.clearAllMocks();

            const getMock = jest.spyOn(AuthService['_CACHE'], 'get');
            const setMock = jest.spyOn(AuthService['_CACHE'], 'set');
            const findMock = jest.spyOn(service['repository'], 'findOne');

            await expect(service.getByDomain('domain.test')).resolves.toEqual(authMock);
            expect(getMock).toHaveBeenCalledTimes(2);
            expect(setMock).not.toHaveBeenCalled();
            expect(findMock).not.toHaveBeenCalled();
        });
    });

    describe('getByToken', () => {
        it('should pass if found', () => {
            return expect(service.getByToken('string')).resolves.toEqual(authMock);
        });

        it('should pass if not found', () => {
            repoMock.findOne.mockReturnValueOnce(null);
            return expect(service.getByToken('string')).resolves.toEqual(null);
        });

        it('should return null', async () => {
            await expect(service.getByToken('')).resolves.toEqual(null);
            await expect(service.getByToken(null)).resolves.toEqual(null);
            await expect(service.getByToken(undefined)).resolves.toEqual(null);
        });
    });

    describe('save', () => {
        it('should update cache after save', async () => {
            const setMock = jest.spyOn(AuthService['_CACHE'], 'set');
            const logMock = jest.spyOn(service['logger'], 'error');
            await expect(service.save(authMock)).toResolve();
            expect(setMock).toHaveBeenCalledOnce();
            expect(AuthService['_CACHE'].get(authMock.member_id)).toEqual(authMock);
            expect(logMock).not.toBeCalled();
        });

        it('should log error', async () => {
            const setMock = jest.spyOn(AuthService['_CACHE'], 'set');
            const logMock = jest.spyOn(service['logger'], 'error');
            repoMock.save.mockImplementationOnce(() => {
                throw 'error';
            });

            await expect(service.save({ ...authMock, member_id: 'errored' })).toResolve();
            expect(setMock).not.toBeCalled();
            expect(AuthService['_CACHE'].get('errored')).toEqual(undefined);
            expect(logMock).toHaveBeenCalledOnce();
        });
    });

    describe('update', () => {
        const auth = {
            member_id: 'upd member_id',
            domain: 'upd domain',
            access_token: 'upd access_token',
            refresh_token: 'upd refresh_token',
            expires_in: 4242,
            version: 42,
        };

        it('should create new auth entity', () => {
            jest.spyOn(service, 'getByMemberId').mockReturnValueOnce(Promise.resolve(null));
            return expect(service.update(auth)).resolves.toEqual({
                active: true,
                member_id: 'upd member_id',
                domain: 'upd domain',
                auth_token: 'upd access_token',
                refresh_token: 'upd refresh_token',
                expires: 4242,
            });
        });

        it('should update existing auth entity', () => {
            jest.spyOn(service, 'getByMemberId').mockReturnValueOnce(
                Promise.resolve({
                    id: 1,
                    domain: 'domain.test',
                    member_id: 'member_id.test',
                    active: false,
                    app_token: 'app_token',
                } as Auth),
            );
            return expect(service.update(auth)).resolves.toEqual({
                id: 1,
                active: true,
                app_token: 'app_token',
                member_id: 'upd member_id',
                domain: 'upd domain',
                auth_token: 'upd access_token',
                refresh_token: 'upd refresh_token',
                expires: 4242,
            });
        });
    });
});
