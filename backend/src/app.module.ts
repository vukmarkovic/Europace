import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import 'winston-daily-rotate-file';
import { AppController } from './app.controller';
import LoggerModule from './common/modules/logger/logger.module';
import ProfilerModule from './common/modules/profiler/profiler.module';
import ErrorHandlerModule from './common/modules/errorhandler/error.handler.module';
import AuthModule from './common/modules/auth/auth.module';
import BxApiModule from './modules/bxapi/bx.api.module';
import { UpdateModule } from './modules/update/update.module';
import SettingsModule from './modules/settings/settings.module';
import { TaskModule } from './modules/task/task.module';
import { MatchingModule } from './modules/matching/matching.module';
import FilesModule from './common/modules/files/files.module';
import { HttpModule } from '@nestjs/axios';
import MysqlProviderModule from './providers/database/mysql/mysql.provider.module';
import { PlacementModule } from './modules/placement/placement.module';
import { EuropaceAuthModule } from './modules/europaceAuth/europaceAuth.module';
import RobotModule from './modules/robot/robot.module';

/**
 * Main application module.
 */
@Module({
    imports: [
        HttpModule,
        MysqlProviderModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'build'),
        }),
        ScheduleModule.forRoot(),
        LoggerModule,
        ProfilerModule,
        ErrorHandlerModule,
        AuthModule,
        BxApiModule,
        UpdateModule,
        SettingsModule,
        TaskModule,
        MatchingModule,
        FilesModule,
        PlacementModule,
        EuropaceAuthModule,
        RobotModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
