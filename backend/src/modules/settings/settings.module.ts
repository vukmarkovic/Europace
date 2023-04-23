import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppSettings from './models/entities/app.settings.entity';
import SettingsService from './settings.service';
import SettingsController from './settings.controller';

/**
 * Module providing service and controller to work with clients portals settings.
 * Also provides corresponding repository.
 * @see SettingsController
 * @see SettingsService
 * @see AppSettings
 * @see Repository
 */
@Module({
    imports: [TypeOrmModule.forFeature([AppSettings])],
    providers: [SettingsService],
    controllers: [SettingsController],
    exports: [SettingsService],
})
export default class SettingsModule {}
