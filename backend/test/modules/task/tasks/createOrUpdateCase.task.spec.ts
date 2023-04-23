import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import EuropaceService from '../../../../src/modules/europace/europace.service';
import MatchingService from '../../../../src/modules/matching/matching.service';
import TaskHelper from '../../../../src/modules/task/utils/task.helper';
import CreateOrUpdateCaseTask from '../../../../src/modules/task/tasks/createOrUpdateCase.task';
import { Auth } from '../../../../src/common/modules/auth/model/entities/auth.entity';
import ErrorHandlerModule from '../../../../src/common/modules/errorhandler/error.handler.module';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

const matchingMock = {
    saveData: jest.fn().mockReturnThis(),
    prepareData: jest.fn().mockReturnValue({
        CREDENTIALS: 132,
        categoryId: 15,
        url: 'url',
        username: 'username',
        password: 'password',
        access_token: '',
        token_type: '',
        responsibleId: 1,
    }),
    getEnum: jest.fn().mockReturnValue({ 10: 'Telefon' }),
};

const europaceMock = {
    getToken: jest.fn().mockReturnValue({ access_token: 'token', token_type: 'bearer' }),
};

const helperMock = {
    saveError: jest.fn().mockReturnThis(),
    saveNotFoundError: jest.fn().mockImplementation(() => false),
    getMatch: jest.fn().mockImplementation(() => ({
        fields: [
            {
                code: 'categoryId_match',
                match: {
                    code: 'categoryId_match',
                    defaultValue: 15,
                },
            },
            {
                code: 'Anschrift',
                match: {
                    code: 'Anschrift_match',
                },
            },
        ],
        idField: 'categoryId_match',
        entityTypeId: 42,
    })),
    checkParent: jest.fn().mockReturnThis(),
};
describe('CreateOrUpdateCaseTask', () => {
    let service: CreateOrUpdateCaseTask;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ErrorHandlerModule],
            providers: [
                CreateOrUpdateCaseTask,
                { provide: MatchingService, useValue: matchingMock },
                { provide: EuropaceService, useValue: europaceMock },
                { provide: TaskHelper, useValue: helperMock },
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
        service = await module.get<CreateOrUpdateCaseTask>(CreateOrUpdateCaseTask);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return if no id', async () => {
        await expect(service.process(authMock, '', '', '')).toResolve();
        expect(matchingMock.prepareData).not.toBeCalled();
    });
});
