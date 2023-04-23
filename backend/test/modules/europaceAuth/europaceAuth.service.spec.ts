import { Test, TestingModule } from '@nestjs/testing';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import { ConfigService } from '@nestjs/config';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import MatchingService from '../../../src/modules/matching/matching.service';
import { EuropaceAuthService } from '../../../src/modules/europaceAuth/europaceAuth.service';
import EuropaceService from ',./../../src/modules/europace/europace.service';
import CreateOrUpdateCaseTask from '../../../src/modules/task/tasks/createOrUpdateCase.task';

jest.mock('@nestjs/common/services');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domaain.test',
    member_id: 'member_id.test',
} as Auth;

const configServiceMock = {
    get: jest.fn().mockReturnValue('APP_BASE_URL'),
};

const europaceMock = {
    getToken: jest.fn().mockReturnThis(),
    updateEditor: jest.fn().mockReturnThis(),
    silentSignIn: jest.fn().mockReturnThis(),
};

const matchingMock = {
    get: jest.fn().mockReturnValue([
        {
            code: 'service',
            base: false,
            type: 'string',
            match: {
                code: 'service',
                defaultValue: 'serviceFieldValue',
            },
        },
    ]),
    getMatch: jest.fn().mockReturnThis(),
    saveData: jest.fn().mockReturnThis(),
    prepareData: jest.fn().mockReturnValue({
        id: 'europaceId',
    }),
    prepareList: jest.fn().mockReturnValue([
        {
            CREDENTIALS: 123,
        },
    ]),
};

const taskMock = {
    process: jest.fn().mockReturnValue(['leadId', {
        access_token: 'token',
        expires_in: 86400,
        token_type: 'bearer',
        scope: 'bitrix24',
    }, 'partnerId'])
}

describe('EuropaceAuthService', () => {
    let service: EuropaceAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EuropaceAuthService,
                ErrorHandler,
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
                {
                    provide: MatchingService,
                    useValue: matchingMock,
                },
                {
                    provide: EuropaceService,
                    useValue: europaceMock,
                },
                {
                    provide: CreateOrUpdateCaseTask,
                    useValue: taskMock
                }
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
        service = await module.get<EuropaceAuthService>(EuropaceAuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUrl', () => {
        it('should throw not found error for empty data', async () => {
            await expect(service['getUrl'](authMock, 188, null, '')).rejects.toThrowWithMessage(NotFoundException, 'wrong.entityId.or.entityTypeId.notFound');

            await expect(service['getUrl'](authMock, null, 4, '')).rejects.toThrowWithMessage(NotFoundException, 'wrong.entityId.or.entityTypeId.notFound');
        });

        it('should throw not found error for lead', async () => {
            matchingMock.prepareData.mockReturnValueOnce(undefined);

            await expect(service['getUrl'](authMock, 188, 42, '')).rejects.toThrowWithMessage(NotFoundException, 'field.Lead.notFound');
        });

        it('should return url', async () => {
            europaceMock.silentSignIn.mockReturnValueOnce(Promise.resolve('someUrl'));

            await expect(service['getUrl'](authMock, 188, 42, 'access_token')).resolves.toBe('someUrl');
        });

        it('should throw internal error', async () => {
            europaceMock.silentSignIn.mockRejectedValueOnce(null);

            await expect(service['getUrl'](authMock, 188, 42, 'access_token'))
               .rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to get auth url to redirect');
        });
    });
});
