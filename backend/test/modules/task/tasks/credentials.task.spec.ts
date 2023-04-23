import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import { Auth } from '../../../../src/common/modules/auth/model/entities/auth.entity';
import { BxApiService } from '../../../../src/modules/bxapi/bx.api.service';
import { Task } from '../../../../src/modules/task/models/entities/task.entity';
import TaskHelper from '../../../../src/modules/task/utils/task.helper';
import CredentialsTask from '../../../../src/modules/task/tasks/credentials.task';
import { TaskService } from '../../../../src/modules/task/task.service';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

const taskServiceMock = {
    queueTask: jest.fn().mockReturnThis(),
} as any;

const taskMock = {
    auth: authMock,
} as Task;

const bxMock = {
    getCRMMap: jest.fn().mockReturnThis(),
    getList: jest.fn().mockReturnThis(),
};

const helperMock = {
    saveNotFoundError: jest.fn().mockImplementation(() => false),
    getMatch: jest.fn().mockImplementation(() => ({
        fields: [
            {
                code: 'service',
                match: {
                    code: 'service_match',
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
        idField: 'service_match',
        entityTypeId: 42,
    })),
    checkParent: jest.fn().mockReturnThis(),
};

describe('CredentialsTask', () => {
    let service: CredentialsTask;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CredentialsTask,
                { provide: TaskService, useValue: taskServiceMock },
                { provide: BxApiService, useValue: bxMock },
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
        service = await module.get<CredentialsTask>(CredentialsTask);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should request credentials matching', async () => {
        jest.spyOn(helperMock, 'getMatch').mockResolvedValueOnce({
            fields: [],
            idField: 'asd',
            entityTypeId: 1,
        });
        await expect(service.process(taskMock, taskServiceMock)).toResolve();
        expect(helperMock.getMatch).toHaveBeenCalledTimes(1);
        expect(bxMock.getList).toHaveBeenCalledTimes(0);
    });

    it('should request bitrix', async () => {
        bxMock.getList.mockResolvedValueOnce({ data: [] });
        await expect(service.process(taskMock, taskServiceMock)).toResolve();
        expect(bxMock.getList).toHaveBeenCalledTimes(1);
    });

    it('should add new task to queue', async () => {
        bxMock.getList.mockReturnValueOnce({
            data: [
                {
                    id: 1,
                },
                {
                    id: 22,
                },
                {
                    id: 333,
                },
            ],
        });
        await expect(service.process(taskMock, taskServiceMock)).toResolve();
        expect(taskServiceMock.queueTask).toHaveBeenNthCalledWith(1, authMock, 'GET_CUSTOMERS_BY_CREDENTIALS', '1');
        expect(taskServiceMock.queueTask).toHaveBeenNthCalledWith(2, authMock, 'GET_CUSTOMERS_BY_CREDENTIALS', '22');
        expect(taskServiceMock.queueTask).toHaveBeenNthCalledWith(3, authMock, 'GET_CUSTOMERS_BY_CREDENTIALS', '333');
    });
});
