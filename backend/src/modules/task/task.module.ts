import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import BxApiModule from '../bxapi/bx.api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './models/entities/task.entity';
import TaskQueue from './models/entities/task.queue.entity';
import { MatchingModule } from '../matching/matching.module';
import TaskHelper from './utils/task.helper';
import CredentialsTask from './tasks/credentials.task';
import EuropaceModule from '../europace/europace.module';
import CreateOrUpdateCaseTask from './tasks/createOrUpdateCase.task';
import GetCaseTask from './tasks/getCase.task';

/**
 * Module providing service and controller to work with cron tasks.
 *
 * Also provides helper service with common operations and tasks repositories.
 * Additionally provides checker to show some tasks status of client's Bitrix24 portal.
 *
 * Uses:
 * - Bitrix24 API integration;
 * - matching interface.
 * @see BxApiModule
 * @see MatchingModule
 * @see TaskService
 * @see TaskHelper
 * @see CreateOrUpdateCaseTask
 * @see CredentialsTask
 * @see Task
 * @see TaskQueue
 * @see Repository
 * @see Cron
 */
@Module({
    imports: [BxApiModule, MatchingModule, TypeOrmModule.forFeature([Task, TaskQueue]), EuropaceModule],
    controllers: [TaskController],
    providers: [TaskService, TaskHelper, CredentialsTask, CreateOrUpdateCaseTask, GetCaseTask],
    exports: [TaskHelper, CredentialsTask, CreateOrUpdateCaseTask, GetCaseTask],
})
export class TaskModule {}
