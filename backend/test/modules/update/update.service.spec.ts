import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import UpdateService from '../../../src/modules/update/update.service';
import MatchingService from '../../../src/modules/matching/matching.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import { AuthService } from '../../../src/common/modules/auth/auth.service';
import IBxAuthData from '../../../src/modules/bxapi/models/intefaces/bx.auth.data';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;
const matchingMock = {
    initiateMatching: jest.fn().mockReturnThis(),
};
const authServiceMock = {
    getByMemberId: jest.fn().mockReturnValue(authMock),
    save: jest.fn().mockReturnThis(),
};

describe('UpdateService', () => {
    let service: UpdateService;
    let logMock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateService,
                ErrorHandler,
                {
                    provide: MatchingService,
                    useValue: matchingMock,
                },
                {
                    provide: BxApiService,
                    useValue: {},
                },
                {
                    provide: AuthService,
                    useValue: authServiceMock,
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
        service = await module.get<UpdateService>(UpdateService);
        logMock = jest.spyOn(service['logger'], 'log');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleVersion', () => {
        it('should process install', () => {
            expect(
                service['handleVersion'](authMock, {
                    domain: 'domain.test',
                    version: 0,
                } as IBxAuthData),
            ).toResolve();

            expect(matchingMock.initiateMatching).toHaveBeenCalled();
        });

        it('should increment version', () => {
            expect(
                service['handleVersion'](authMock, {
                    domain: 'domain.test',
                    version: 1,
                } as IBxAuthData),
            ).toResolve();

            expect(logMock).toHaveBeenCalledWith(`domain.test successfully updated from 1 to ${UpdateService.CURRENT_VERSION}`);
            expect(matchingMock.initiateMatching).not.toBeCalled();
        });

        it('should do nothing', () => {
            expect(
                service['handleVersion'](authMock, {
                    domain: 'domain.test',
                    version: 10000,
                } as IBxAuthData),
            ).toResolve();

            expect(logMock).toHaveBeenCalledWith('domain.test is up to date');
            expect(matchingMock.initiateMatching).not.toBeCalled();
        });
    });

    describe('handle', () => {
        it('should update auth', async () => {
            jest.spyOn(authServiceMock, 'getByMemberId').mockReturnValueOnce(authMock);
            const saveMock = jest.spyOn(authServiceMock, 'save');

            await expect(
                service.handle({
                    domain: 'domain.test',
                    member_id: 'member_id',
                    access_token: 'access_token_data',
                    refresh_token: 'refresh_token_data',
                    expires_in: 12345678,
                    version: 10000,
                }),
            ).toResolve();

            expect(saveMock).toHaveBeenCalledWith({
                ...authMock,
                domain: 'domain.test',
                auth_token: 'access_token_data',
                refresh_token: 'refresh_token_data',
                expires: 12345678,
                member_id: 'member_id',
                active: true,
            });
        });

        it('should create auth', async () => {
            jest.spyOn(authServiceMock, 'getByMemberId').mockReturnValueOnce(new Auth());
            const saveMock = jest.spyOn(authServiceMock, 'save');

            await expect(
                service.handle({
                    domain: 'domain.test',
                    member_id: 'member_id',
                    access_token: 'access_token_data',
                    refresh_token: 'refresh_token_data',
                    expires_in: 12345678,
                    version: 10000,
                }),
            ).toResolve();

            expect(saveMock).toHaveBeenCalledWith({
                domain: 'domain.test',
                auth_token: 'access_token_data',
                refresh_token: 'refresh_token_data',
                expires: 12345678,
                member_id: 'member_id',
                active: true,
            });
        });
    });
});
