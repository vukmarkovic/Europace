import { Module } from '@nestjs/common';
import RobotController from './robot.controller';
import RobotService from './robot.service';
import BxApiModule from '../bxapi/bx.api.module';
import EuropaceModule from '../europace/europace.module';
import { MatchingModule } from '../matching/matching.module';
import { TaskModule } from '../task/task.module';

/**
 * Module providing Bitrix24 robot handlers and endpoints.
 * Handlers use tasks as processors.
 *
 * Uses:
 * - Bitrix24 API integration;
 * - Europace API integration;
 * - matching interface;
 * - scheduler.
 *
 * @see RobotController
 * @see RobotService
 * @see BxApiModule
 * @see TuristaModule
 * @see MatchingModule
 * @see TaskModule
 */
@Module({
    imports: [BxApiModule, EuropaceModule, MatchingModule, TaskModule],
    controllers: [RobotController],
    providers: [RobotService],
})
export default class RobotModule {}
