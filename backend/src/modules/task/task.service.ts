import { Injectable, Logger } from '@nestjs/common';
import { LessThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import DurationConstructor = moment.unitOfTime.DurationConstructor;
import { Cron, CronExpression } from '@nestjs/schedule';
import { Task } from './models/entities/task.entity';
import TaskQueue from './models/entities/task.queue.entity';
import TaskDto from './models/dto/task.dto';
import { TaskType } from './models/types/task.type';
import { TaskStatus } from './models/types/task.status';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';
import CredentialsTask from './tasks/credentials.task';

/**
 * Service providing operations with cron tasks:
 * - queue;
 * - dequeue;
 * - processing;
 * - configuring.
 *
 * Tasks are unique by type within client's Bitrix24 portal.
 * May be get and should be updated by auth data.
 *
 * Uses:
 * - tasks repositories;
 * - task processors.
 * @see Task
 * @see TaskQueue
 * @see TaskHelper
 * @see CredentialsTask
 * @see CustomersByCredentialsTask
 * @see Cron
 * @see Auth
 */
@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(
        @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
        @InjectRepository(TaskQueue) private readonly queueRepository: Repository<TaskQueue>,
        private readonly credentialsTask: CredentialsTask,
        private readonly errorHandler: ErrorHandler,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Lists all registered tasks for client's Bitrix24 portal.
     * @param auth - authentication data.
     * @returns TaskDto[] - list of tasks.
     * @throws InternalServerErrorException - if failed to read from database.
     * @see Auth
     * @see TaskDto
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async listTasks(auth: Auth): Promise<TaskDto[]> {
        try {
            return (await this.taskRepository.find({ where: { auth } })).map((x) => new TaskDto(x));
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to list tasks', e });
        }
    }

    /**
     * Updates task configuration:
     * - interval type
     * - interval value
     * - start date (task may be pending until some date).
     * If no task found creates one.
     * Clears old task from queue.
     * If interval is different from `NONE` set, queues updated task.
     * @param auth - authentication data.
     * @param dto - task configuration.
     * @returns number - updated task id.
     * @throws NotFoundException if task id received but no task found.
     * @see Auth
     * @see TaskDto
     * @see TaskInterval
     * @see TaskType
     * @see find
     * @see save
     * @see clearQueue
     * @see queue
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async updateTask(auth: Auth, dto: TaskDto): Promise<number> {
        const task = dto.id ? await this.find({ id: dto.id, type: dto.type }, auth) : new Task(dto.type, auth);

        if (dto.id && !task?.id) {
            this.errorHandler.notFound(auth, `Task [${dto.id}] not found`, 'task.notFound');
        }

        task.intervalType = dto.intervalType;
        task.interval = dto.interval;
        task.startDate = dto.startDate ?? new Date();

        await this.save(auth, task);

        await this.clearQueue(task);

        if (task.intervalType !== 'NONE') {
            await this.queue(task, task.startDate);
        }

        return task.id;
    }

    /**
     * Adds task to queue.
     * If no task found by type creates new one.
     * @param auth - authentication data.
     * @param type - task type.
     * @param data - additional task data.
     * @returns TaskStatus - task queue status (always `PENDING`).
     * @see Auth
     * @see TaskType
     * @see TaskStatus
     * @see find
     * @see save
     */
    async queueTask(auth: Auth, type: TaskType, data = ''): Promise<TaskStatus> {
        let task = await this.find({ type, data: data }, auth);
        if (!task?.id) {
            task = await this.save(auth, new Task(type, auth, data));
        }

        await this.queue(task, new Date(), true);

        return 'PENDING' as TaskStatus;
    }

    /**
     * Task processor.
     * Uses nestjs scheduler to extract and process `PENDING` tasks every 10 seconds.
     * If client's auth data inactive dequeues task without processing.
     * If task processed successfully removes it from queue else updates with `ERROR` status and error message.
     * If task has interval type different from `NONE` requeues task.
     * @see Cron
     * @see TaskQueue
     * @see TaskType
     * @see TaskInterval
     * @see queue
     * @see dequeue
     * @see save
     * @see updateStatus
     */
    @Cron(CronExpression.EVERY_10_SECONDS)
    async processQueue(): Promise<void> {
        const take = this.configService.get<number>('TASK_PROCESS_COUNT') ?? 1;

        const queue = await this.queueRepository.find({
            where: {
                status: 'PENDING',
                date: LessThanOrEqual(new Date()),
            },
            order: {
                id: 'ASC',
            },
            relations: ['task', 'task.auth'],
            take: take,
        });

        if (!queue.length) return;

        await this.updateStatus(queue, 'IN_PROGRESS');

        for (const item of queue) {
            if (!item.task?.auth?.active) {
                await this.dequeue(item);
                continue;
            }

            this.logger.log({
                domain: item.task.auth.domain,
                message: `Executing task [${item.task.type}] for [${item.task.auth.domain}]`,
            });
            const start = new Date().getTime();
            try {
                switch (item.task.type) {
                    case 'STUB':
                        this.logger.error({
                            message: 'Executing stub task... It should not be',
                            domain: item.task.auth.domain,
                        });
                        break;
                    case 'GET_CUSTOMERS':
                        await this.credentialsTask.process(item.task, this);
                        break;
                    default:
                        this.errorHandler.internal({
                            auth: item.task.auth,
                            message: 'Unknown task type: ' + item.task.type,
                        });
                }
                await this.dequeue(item);
            } catch (e) {
                await this.updateStatus(item, 'ERROR', e.message);
                this.logger.error({
                    domain: item.task.auth.domain,
                    message: `Task [${item.task.type}] for [${item.task.auth.domain}] errored`,
                });
            } finally {
                item.task.lastRunDate = item.date;
                await this.save(item.task.auth, item.task);

                if (item.task.intervalType !== 'NONE') {
                    await this.queue(item.task);
                }

                if (!item.error) {
                    this.logger.log({
                        domain: item.task.auth.domain,
                        message: `Task [${item.task.type}] for [${item.task.auth.domain}] executed`,
                        durationMs: new Date().getTime() - start,
                    });
                }
            }
        }
    }

    /**
     * Gets task from data base by id or auth data and task type.
     * @param id - task id.
     * @param type - task type.
     * @param auth - authentication data.
     * @param data - additional task data
     * @returns Task if found.
     * @throws InternalServerErrorException if request to database failed.
     * @see Auth
     * @see Task
     * @see TaskType
     * @see InternalServerErrorException
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    private async find({ id, type, data }: { id?: number; type?: TaskType; data?: string }, auth?: Auth): Promise<Task> {
        if (!id && !type) return null;

        const where = {} as any;
        if (id) {
            where.id = id;
        } else {
            where.type = type;
            where.authId = auth.id;
            where.data = data;
        }

        try {
            return await this.taskRepository.findOne({
                relations: ['auth'],
                where,
            });
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to find task', e });
        }
    }

    /**
     * Saves task to database.
     * @param auth - authentication data.
     * @param task - task item.
     * @returns Task - added or updated task item.
     * @throws InternalServerErrorException if no task type set or database request failed.
     * @see Auth
     * @see Task
     * @see TaskType
     * @see InternalServerErrorException
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async save(auth: Auth, task: Task): Promise<Task> {
        if (!task?.type) {
            this.errorHandler.internal({ auth, message: 'Empty task object' });
        }

        if (!task.interval || task.interval < 1) {
            task.intervalType = 'NONE';
        }
        if (task.intervalType === 'NONE') {
            task.interval = 0;
            task.startDate = null;
        }

        try {
            await this.taskRepository.save(task);
            return task;
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to save task', e });
        }
    }

    /**
     * Adds task to queue.
     * If task is already `PENDING` or has interval type `NONE` returns, except `executeNow` flag provided.
     * @param task - task item.
     * @param startDate - task execution start date (optional),
     * if not provided start date calculated from last run date by interval type.
     * @param executeNow - force execute now flag (default false).
     * @throws InternalServerErrorException if database request failed.
     * @see Task
     * @see TaskQueue
     * @see TaskInterval
     * @see InternalServerErrorException
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async queue(task: Task, startDate?: Date, executeNow = false): Promise<void> {
        if (!task?.id) return;

        if (
            !executeNow &&
            (task.intervalType === 'NONE' ||
                (
                    await this.queueRepository.findOne({
                        where: {
                            taskId: task.id,
                            status: 'PENDING',
                        },
                    })
                )?.id)
        ) {
            return;
        }

        const item = new TaskQueue();
        item.task = task;
        item.status = 'PENDING';
        item.date = (
            startDate
                ? moment(startDate)
                : moment(task.lastRunDate ?? new Date()).add(task.interval, (task.intervalType.toLowerCase() + 's') as DurationConstructor)
        )
            .startOf('minute')
            .toDate();

        try {
            await this.queueRepository.save(item);
        } catch (e) {
            this.errorHandler.internal({ auth: task.auth, message: 'Failed to queue task', e });
        }
    }

    /**
     * Removes task from queue.
     * Used for inactive or successfully processed tasks.
     * @param item - task queue item.
     * @throws InternalServerErrorException if database request failed.
     * @see TaskQueue
     * @see InternalServerErrorException
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async dequeue(item: TaskQueue): Promise<void> {
        try {
            await this.queueRepository.remove(item);
        } catch (e) {
            this.errorHandler.internal({ auth: item.task.auth, message: 'Failed to dequeue task', e });
        }
    }

    /**
     * Removes all `PENDING` queued tasks.
     * Used when task configuration updated.
     * @param task - updated task.
     * @throws InternalServerErrorException - if database request failed.
     * @see Task
     * @see InternalServerErrorException
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async clearQueue(task: Task) {
        try {
            await this.queueRepository.delete({ taskId: task.id, status: 'PENDING' });
        } catch (e) {
            this.errorHandler.internal({ auth: task.auth, message: 'Failed to clear queue for task', e });
        }
    }

    /**
     * Updates task status in queue.
     * May be used for batch updates.
     * @param items - task or tasks to change status.
     * @param status - new status.
     * @param error - error message (optional), used when `ERROR` status setting.
     * @see TaskQueue
     * @see TaskStatus
     * @throws InternalServerErrorException - if database request failed.
     * @see InternalServerErrorException
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async updateStatus(items: TaskQueue | TaskQueue[], status: TaskStatus, error?: string): Promise<void> {
        items = Array.isArray(items) ? items : [items];

        if (!items.length) return;

        items.forEach((item) => {
            item.status = status;
            item.error = error;
        });
        try {
            await this.queueRepository.save(items);
        } catch (e) {
            this.errorHandler.internal({ auth: items[0].task.auth, message: 'Failed to update task status', e });
        }
    }
}
