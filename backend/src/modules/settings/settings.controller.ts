import { Body, Controller, Get, HttpCode, Inject, Param, Put, UseGuards } from '@nestjs/common';
import SettingsService from './settings.service';
import AppSettings from './models/entities/app.settings.entity';
import InstallationGuard from '../../common/guards/installation.guard';
import Auth from '../../common/decorators/auth.decorator';
import { Auth as AuthEntity } from '../../common/modules/auth/model/entities/auth.entity';

/**
 * Application settings for client's Bitrix24 portal controller.
 * Provides endpoints:
 * - /settings/admins - GET, returns app administrators.
 * - /settings/admins - POST, save app administrators.
 * - /settings/byKey/:key - GET, returns value of AppSettings for requested key.
 * - /settings/byKey/:key - PUT, replaces the value of AppSettings for requested key.
 *
 * Use guard to identify client's portal.
 * @see InstallationGuard
 * @see SettingsService
 */
@Controller('settings')
export default class SettingsController {
    constructor(@Inject(SettingsService) private readonly settings: SettingsService) {}

    @Get('byKey/:key')
    @UseGuards(InstallationGuard)
    getSettingsByKey(@Auth() auth: AuthEntity, @Param('key') key: keyof AppSettings) {
        return this.settings.getSettings(auth, key);
    }

    @Put('byKey/:key')
    @UseGuards(InstallationGuard)
    @HttpCode(204)
    updateSettingsByKey(@Auth() auth: AuthEntity, @Param('key') key: keyof AppSettings, @Body() data: { value: any }) {
        this.settings.saveSettings(auth, key, data.value);
    }
}
