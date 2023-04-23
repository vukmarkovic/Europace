import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import TaskDto from './models/dto/task.dto';
import { TaskType } from './models/types/task.type';
import { TaskStatus } from './models/types/task.status';
import InstallationGuard from '../../common/guards/installation.guard';
import Auth from '../../common/decorators/auth.decorator';
import { Auth as AuthEntity } from '../../common/modules/auth/model/entities/auth.entity';

/**
 * Cron tasks controller.
 * Provides endpoints:
 * - /task - GET, returns all registered task for client's Bitrix24 portal.
 * - /task - POST, creates or updates task configuration.
 * - /task/:type - GET, adds existing task to process queue.
 *
 * Use guard to identify client's portal.
 * @see InstallationGuard
 * @see TaskService
 */
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Get()
    @UseGuards(InstallationGuard)
    list(@Auth() auth: AuthEntity): Promise<TaskDto[]> {
        return this.taskService.listTasks(auth);
    }

    @Post()
    @UseGuards(InstallationGuard)
    @HttpCode(201)
    update(@Auth() auth: AuthEntity, @Body() task: TaskDto): Promise<number> {
        return this.taskService.updateTask(auth, task);
    }

    @Get(':type')
    @UseGuards(InstallationGuard)
    queue(@Auth() auth: AuthEntity, @Param('type') type: TaskType): Promise<TaskStatus> {
        return this.taskService.queueTask(auth, type);
    }
}
