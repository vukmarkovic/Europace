import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../../src/modules/task/models/entities/task.entity';
import TaskQueue from '../../../src/modules/task/models/entities/task.queue.entity';
import { TaskService } from '../../../src/modules/task/task.service';
import * as moment from 'moment';
import { TaskType } from '../../../src/modules/task/models/types/task.type';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
    active: true,
} as Auth;
const repoMock = {
    findOne: jest.fn().mockReturnValue({ id: 42 }),
    find: jest.fn().mockReturnValue([
        {
            id: 42,
            intervalType: 'MINUTE',
            interval: 7,
            type: 'STUB',
            auth: authMock,
            lastRunDate: new Date(),
            startDate: new Date(),
        } as Task,
    ]),
    save: jest.fn().mockReturnThis(),
};
const queueRepoMock = {
    find: jest.fn().mockReturnValue([]),
    findOne: jest.fn().mockReturnValue(null),
    save: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
};

describe('TaskService', () => {
    let service: TaskService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                ErrorHandler,
                {
                    provide: getRepositoryToken(Task),
                    useValue: repoMock,
                },
                {
                    provide: getRepositoryToken(TaskQueue),
                    useValue: queueRepoMock,
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
        service = await module.get<TaskService>(TaskService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updateStatus', () => {
        it('should throw internal error', () => {
            jest.spyOn(queueRepoMock, 'save').mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service['updateStatus']([{ task: { auth: authMock } } as TaskQueue], 'PENDING')).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to update task status',
            );
        });

        it('should return if no tasks provided', async () => {
            await expect(service['updateStatus']([], 'PENDING')).toResolve();
            expect(queueRepoMock.save).not.toBeCalled();
        });

        it('should save single task', async () => {
            await expect(service['updateStatus']({ task: { auth: authMock } } as TaskQueue, 'IN_PROGRESS')).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith([{ task: { auth: authMock }, status: 'IN_PROGRESS' }]);
        });

        it('should save array of tasks', async () => {
            await expect(service['updateStatus']([{ task: { auth: authMock } }, { task: { auth: authMock } }] as TaskQueue[], 'IN_PROGRESS')).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith([
                { task: { auth: authMock }, status: 'IN_PROGRESS' },
                { task: { auth: authMock }, status: 'IN_PROGRESS' },
            ]);
        });

        it('should save error', async () => {
            await expect(service['updateStatus']({ task: { auth: authMock } } as TaskQueue, 'IN_PROGRESS', 'error')).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith([{ task: { auth: authMock }, status: 'IN_PROGRESS', error: 'error' }]);
        });
    });

    describe('clearQueue', () => {
        it('should throw internal error', () => {
            jest.spyOn(queueRepoMock, 'delete').mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service['clearQueue']({ auth: authMock } as Task)).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to clear queue for task',
            );
        });

        it('should delete rows', async () => {
            await expect(service['clearQueue']({ id: 42, auth: authMock } as Task)).toResolve();
            expect(queueRepoMock.delete).toHaveBeenCalledWith({
                taskId: 42,
                status: 'PENDING',
            });
        });
    });

    describe('dequeue', () => {
        it('should throw internal error', () => {
            jest.spyOn(queueRepoMock, 'remove').mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service['dequeue']({ task: { auth: authMock } } as TaskQueue)).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to dequeue task',
            );
        });

        it('should remove', async () => {
            await expect(service['dequeue']({ task: { auth: authMock } } as TaskQueue)).toResolve();
            expect(queueRepoMock.remove).toHaveBeenCalledWith({ task: { auth: authMock } });
        });
    });

    describe('queue', () => {
        it('should return if no task id', async () => {
            await expect(service['queue']({} as Task)).toResolve();
            expect(queueRepoMock.save).not.toBeCalled();
        });

        it('should return if pending task exists', async () => {
            queueRepoMock.findOne.mockReturnValueOnce({ id: 42 });
            await expect(service['queue']({ id: 42, intervalType: 'HOUR', interval: 1 } as Task)).toResolve();
            await expect(service['queue']({ id: 42, intervalType: 'NONE', interval: 1 } as Task)).toResolve();

            expect(queueRepoMock.save).not.toBeCalled();
        });

        it('should add duplicating task', async () => {
            await expect(service['queue']({ id: 42, interval: 1, intervalType: 'NONE' } as Task, null, true)).toResolve();
            await expect(service['queue']({ id: 42, interval: 1, intervalType: 'HOUR' } as Task)).toResolve();

            expect(queueRepoMock.save).toHaveBeenCalledTimes(2);
        });

        it('should add task with provided start date', async () => {
            await expect(service['queue']({ id: 42 } as Task, new Date('2021-01-02T03:04:05+00:00'))).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith({
                task: { id: 42 },
                status: 'PENDING',
                date: new Date('2021-01-02T03:04:00+00:00'),
            });
        });

        it('should add task with calculated date', async () => {
            await expect(
                service['queue']({
                    id: 42,
                    intervalType: 'MINUTE',
                    interval: 2,
                    lastRunDate: new Date('2021-01-02T03:04:05+00:00'),
                } as Task),
            ).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith({
                task: expect.toBeObject(),
                status: 'PENDING',
                date: new Date('2021-01-02T03:06:00+00:00'),
            });

            await expect(
                service['queue']({
                    id: 42,
                    intervalType: 'HOUR',
                    interval: 5,
                    lastRunDate: new Date('2021-01-02T03:04:05+00:00'),
                } as Task),
            ).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith({
                task: expect.toBeObject(),
                status: 'PENDING',
                date: new Date('2021-01-02T08:04:00+00:00'),
            });

            await expect(
                service['queue']({
                    id: 42,
                    intervalType: 'DAY',
                    interval: 1,
                    lastRunDate: new Date('2021-01-02T03:04:05+00:00'),
                } as Task),
            ).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith({
                task: expect.toBeObject(),
                status: 'PENDING',
                date: new Date('2021-01-03T03:04:00+00:00'),
            });
        });

        it('should add task with now date', async () => {
            const nowMinute = moment(new Date()).startOf('minute');
            const nowHour = moment(new Date()).startOf('minute');
            const nowDay = moment(new Date()).startOf('minute');

            await expect(
                service['queue']({
                    id: 42,
                    intervalType: 'MINUTE',
                    interval: 3,
                } as Task),
            ).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith({
                task: expect.toBeObject(),
                status: 'PENDING',
                date: nowMinute.add(3, 'minutes').toDate(),
            });

            await expect(
                service['queue']({
                    id: 42,
                    intervalType: 'HOUR',
                    interval: 1,
                } as Task),
            ).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith({
                task: expect.toBeObject(),
                status: 'PENDING',
                date: nowHour.add(1, 'hours').toDate(),
            });

            await expect(
                service['queue']({
                    id: 42,
                    intervalType: 'DAY',
                    interval: 2,
                } as Task),
            ).toResolve();
            expect(queueRepoMock.save).toHaveBeenCalledWith({
                task: expect.toBeObject(),
                status: 'PENDING',
                date: nowDay.add(2, 'days').toDate(),
            });
        });

        it('should throw internal error', () => {
            jest.spyOn(queueRepoMock, 'save').mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service['queue']({ id: 42, auth: authMock, intervalType: 'MINUTE' } as Task)).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to queue task',
            );
        });
    });

    describe('save', () => {
        it('should throw internal error if task type missing', () => {
            return expect(service['save'](authMock, {} as Task)).rejects.toThrowWithMessage(InternalServerErrorException, 'Empty task object');
        });

        it('should throw internal error if database request failed', () => {
            repoMock.save.mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service['save'](authMock, { type: 'STUB' } as Task)).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to save task');
        });

        it('should set interval type to `NONE`', async () => {
            const task = {
                type: 'STUB',
                intervalType: 'HOUR',
            } as Task;
            await expect(service['save'](authMock, task)).resolves.toEqual({
                ...task,
                intervalType: 'NONE',
                interval: 0,
            });

            task.interval = 0;
            await expect(service['save'](authMock, task)).resolves.toEqual({
                ...task,
                intervalType: 'NONE',
                interval: 0,
            });

            task.interval = -42;
            await expect(service['save'](authMock, task)).resolves.toEqual({
                ...task,
                intervalType: 'NONE',
                interval: 0,
            });
        });

        it('should set interval to 0', () => {
            const task = {
                type: 'STUB',
                intervalType: 'NONE',
                interval: 42,
            } as Task;
            return expect(service['save'](authMock, task)).resolves.toEqual({
                ...task,
                intervalType: 'NONE',
                interval: 0,
            });
        });

        it('should save successfully', async () => {
            const task = {
                type: 'STUB',
                intervalType: 'MINUTE',
                interval: 42,
            } as Task;
            return expect(service['save'](authMock, task)).resolves.toEqual({
                ...task,
                intervalType: 'MINUTE',
                interval: 42,
            });
        });
    });

    describe('find', () => {
        it('should return null', async () => {
            await expect(service['find']({}, authMock)).resolves.toBeNull();
        });

        it('should find by id', async () => {
            await expect(service['find']({ id: 42 }, authMock)).toResolve();
            expect(repoMock.findOne).toHaveBeenCalledWith({
                relations: ['auth'],
                where: {
                    id: 42,
                },
            });
        });

        it('should find by type', async () => {
            await expect(service['find']({ type: 'STUB' }, authMock)).toResolve();
            expect(repoMock.findOne).toHaveBeenCalledWith({
                relations: ['auth'],
                where: {
                    type: 'STUB',
                    authId: 1,
                },
            });
        });

        it('should throw internal error', () => {
            repoMock.findOne.mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service['find']({ id: 42 }, authMock)).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to find task');
        });
    });

    describe('processQueue', () => {
        let stubMock;
        let customersMock;
        let dequeueMock;
        let logMock;

        beforeEach(() => {
            stubMock = jest.spyOn(service['logger'], 'error');
            customersMock = jest.spyOn(service['credentialsTask'], 'process');
            dequeueMock = jest.spyOn(service as any, 'dequeue');
            logMock = jest.spyOn(service['logger'], 'log');
        });

        it('should return if queue is empty', async () => {
            const statusMock = jest.spyOn(service as any, 'updateStatus');
            await expect(service.processQueue()).toResolve();
            expect(statusMock).not.toBeCalled();
        });

        it('should not process task for inactive auth', async () => {
            queueRepoMock.find.mockReturnValueOnce([
                {
                    task: { auth: { active: false } },
                } as TaskQueue,
            ]);
            await expect(service.processQueue()).toResolve();
            expect(logMock).not.toBeCalled();
        });

        it('should process STUB', async () => {
            queueRepoMock.find.mockReturnValueOnce([
                {
                    task: { type: 'STUB', auth: authMock },
                } as TaskQueue,
            ]);
            await expect(service.processQueue()).toResolve();
            expect(stubMock).toHaveBeenCalled();
            expect(customersMock).not.toBeCalled();
            expect(dequeueMock).toHaveBeenCalled();
        });

        it('should process GET_CUSTOMERS', async () => {
            queueRepoMock.find.mockReturnValueOnce([
                {
                    task: { type: 'GET_CUSTOMERS', auth: authMock },
                } as TaskQueue,
            ]);
            await expect(service.processQueue()).toResolve();
            expect(stubMock).not.toBeCalled();
            expect(customersMock).toHaveBeenCalled();
            expect(dequeueMock).toHaveBeenCalled();
        });

        // it('should process GET_CUSTOMERS_BY_CREDENTIALS', async () => {
        //     queueRepoMock.find.mockReturnValueOnce([
        //         {
        //             task: { type: 'GET_CUSTOMERS_BY_CREDENTIALS', auth: authMock },
        //         } as TaskQueue,
        //     ]);
        //     await expect(service.processQueue()).toResolve();
        //     expect(stubMock).not.toBeCalled();
        //     expect(customersMock).not.toBeCalled();
        //     expect(tokenMock).toHaveBeenCalled();
        //     expect(dequeueMock).toHaveBeenCalled();
        // });

        it('should throw internal error', async () => {
            const statusMock = jest.spyOn(service as any, 'updateStatus');
            queueRepoMock.find.mockReturnValueOnce([
                {
                    task: { type: 'WRONG' as TaskType, auth: authMock },
                } as TaskQueue,
            ]);
            await expect(service.processQueue()).toResolve();
            expect(statusMock).toHaveBeenLastCalledWith(
                {
                    error: 'Unknown task type: WRONG',
                    status: 'ERROR',
                    task: {
                        type: 'WRONG',
                        auth: authMock,
                        intervalType: 'NONE',
                        interval: 0,
                        startDate: null,
                    },
                },
                'ERROR',
                'Unknown task type: WRONG',
            );
        });

        it('should store error', async () => {
            const statusMock = jest.spyOn(service as any, 'updateStatus');
            queueRepoMock.find.mockReturnValueOnce([
                {
                    task: { type: 'GET_CUSTOMERS', auth: authMock },
                } as TaskQueue,
            ]);
            customersMock.mockImplementationOnce(() => {
                throw new Error('some error');
            });

            await expect(service.processQueue()).toResolve();
            expect(logMock).toHaveBeenCalledOnce();
            expect(dequeueMock).not.toBeCalled();
            expect(statusMock).toHaveBeenCalledTimes(2);
            expect(statusMock).toHaveBeenLastCalledWith(
                {
                    error: 'some error',
                    status: 'ERROR',
                    task: {
                        type: 'GET_CUSTOMERS',
                        auth: authMock,
                        intervalType: 'NONE',
                        interval: 0,
                        startDate: null,
                    },
                },
                'ERROR',
                'some error',
            );
        });

        it('should update lasRunDate', async () => {
            const statusMock = jest.spyOn(service as any, 'updateStatus');
            const saveMock = jest.spyOn(service as any, 'save');
            queueRepoMock.find.mockReturnValueOnce([
                {
                    task: { type: 'GET_CUSTOMERS', auth: authMock, intervalType: 'NONE' },
                    date: new Date(),
                } as TaskQueue,
            ]);

            await expect(service.processQueue()).toResolve();
            expect(logMock).toHaveBeenCalledTimes(2);
            expect(dequeueMock).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledOnce();
            expect(saveMock).toHaveBeenLastCalledWith(authMock, {
                type: 'GET_CUSTOMERS',
                auth: authMock,
                lastRunDate: expect.toBeDate(),
                intervalType: 'NONE',
                interval: 0,
                startDate: null,
            });
        });

        it('should requeue task', async () => {
            const queueMock = jest.spyOn(service as any, 'queue');
            queueRepoMock.find
                .mockReturnValueOnce([
                    {
                        task: { type: 'GET_CUSTOMERS', auth: authMock, intervalType: 'MINUTE', interval: 1 },
                    } as TaskQueue,
                ])
                .mockReturnValueOnce([
                    {
                        task: { type: 'GET_CUSTOMERS', auth: authMock, intervalType: 'HOUR', interval: 1 },
                    } as TaskQueue,
                ])
                .mockReturnValueOnce([
                    {
                        task: { type: 'GET_CUSTOMERS', auth: authMock, intervalType: 'DAY', interval: 1 },
                    } as TaskQueue,
                ]);

            await expect(service.processQueue()).toResolve();
            await expect(service.processQueue()).toResolve();
            await expect(service.processQueue()).toResolve();
            expect(queueMock).toHaveBeenCalledTimes(3);
            expect(dequeueMock).toHaveBeenCalledTimes(3);
        });

        it('should not requeue task', async () => {
            const queueMock = jest.spyOn(service as any, 'queue');
            queueRepoMock.find
                .mockReturnValueOnce([
                    {
                        task: { type: 'GET_CUSTOMERS', auth: authMock, intervalType: 'NONE' },
                    } as TaskQueue,
                ])
                .mockReturnValueOnce([
                    {
                        task: { type: 'GET_CUSTOMERS', auth: authMock, intervalType: 'DAY' },
                    } as TaskQueue,
                ]);

            await expect(service.processQueue()).toResolve();
            expect(queueMock).not.toBeCalled();
            expect(dequeueMock).toHaveBeenCalledOnce();
        });
    });

    describe('queueTask', () => {
        let saveMock;
        beforeEach(() => {
            jest.spyOn(service as any, 'queue').mockImplementationOnce(() => {
                /* do nothing */
            });
            saveMock = jest.spyOn(service as any, 'save').mockImplementationOnce(() => {
                /* do nothing */
            });
        });

        it('should queue existing task', async () => {
            jest.spyOn(service as any, 'find').mockReturnValueOnce({ id: 42 });
            await expect(service.queueTask(authMock, 'STUB')).resolves.toEqual('PENDING');
            expect(saveMock).not.toBeCalled();
        });

        it('should create new task', async () => {
            jest.spyOn(service as any, 'find').mockReturnValueOnce(null);
            await expect(service.queueTask(authMock, 'STUB')).resolves.toEqual('PENDING');
            expect(saveMock).toHaveBeenCalledOnce();
        });

        it('should create new task with data', async () => {
            jest.spyOn(service as any, 'find').mockReturnValueOnce(null);
            await expect(service.queueTask(authMock, 'STUB', 'asdf')).resolves.toEqual('PENDING');
            expect(saveMock).toHaveBeenCalledWith(authMock, {
                auth: authMock,
                data: 'asdf',
                intervalType: 'NONE',
                startDate: expect.toBeDate(),
                type: 'STUB',
            });
        });
    });

    describe('updateTask', () => {
        let queueMock;
        let saveMock;
        beforeEach(() => {
            queueMock = jest.spyOn(service as any, 'queue').mockImplementationOnce(() => {
                /* do nothing */
            });
            saveMock = jest.spyOn(service as any, 'save').mockImplementationOnce(() => {
                /* do nothing */
            });
            jest.spyOn(service as any, 'clearQueue').mockImplementationOnce(() => {
                /* do nothing */
            });
        });

        it('should update existing task', async () => {
            const findMock = jest.spyOn(service as any, 'find').mockReturnValueOnce({ id: 42 });

            await expect(
                service.updateTask(authMock, {
                    type: 'STUB',
                    intervalType: 'NONE',
                    interval: 0,
                    id: 42,
                }),
            ).resolves.toEqual(42);

            expect(findMock).toHaveBeenCalledOnce();
            expect(queueMock).not.toBeCalled();
            expect(saveMock).toHaveBeenCalledWith(authMock, {
                intervalType: 'NONE',
                interval: 0,
                id: 42,
                startDate: expect.toBeDate(),
            });
        });

        it('should create new task', async () => {
            const findMock = jest.spyOn(service as any, 'find').mockReturnValueOnce({ id: 42 });

            await expect(
                service.updateTask(authMock, {
                    type: 'STUB',
                    intervalType: 'NONE',
                    interval: 0,
                }),
            ).resolves.toEqual(undefined);

            expect(findMock).not.toBeCalled();
            expect(queueMock).not.toBeCalled();
            expect(saveMock).toHaveBeenCalledWith(authMock, {
                auth: authMock,
                data: '',
                type: 'STUB',
                intervalType: 'NONE',
                interval: 0,
                startDate: expect.toBeDate(),
            });
        });

        it('should queue task', async () => {
            const findMock = jest.spyOn(service as any, 'find').mockReturnValueOnce({ id: 42 });

            await expect(
                service.updateTask(authMock, {
                    type: 'STUB',
                    intervalType: 'HOUR',
                    interval: 1,
                }),
            ).resolves.toEqual(undefined);

            expect(findMock).not.toBeCalled();
            expect(queueMock).toHaveBeenCalledOnce();
        });

        it('should throw not found error', () => {
            jest.spyOn(service as any, 'find').mockReturnValueOnce(null);

            return expect(
                service.updateTask(authMock, {
                    type: 'STUB',
                    intervalType: 'NONE',
                    interval: 0,
                    id: 42,
                }),
            ).rejects.toThrowWithMessage(NotFoundException, 'task.notFound');
        });
    });

    describe('listTasks', () => {
        it('should return list', () => {
            return expect(service.listTasks(authMock)).resolves.toEqual([
                {
                    id: 42,
                    intervalType: 'MINUTE',
                    interval: 7,
                    type: 'STUB',
                    startDate: expect.toBeDate(),
                    lastRunDate: expect.toBeDate(),
                },
            ]);
        });

        it('should throw internal error', () => {
            repoMock.find.mockImplementationOnce(() => {
                throw 'error';
            });
            return expect(service.listTasks(authMock)).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to list tasks');
        });
    });
});
