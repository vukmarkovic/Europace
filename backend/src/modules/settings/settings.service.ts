import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import AppSettings from './models/entities/app.settings.entity';
import { Repository } from 'typeorm';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';

/**
 * Service providing reading and writing client portal's settings.
 * Uses:
 * - settings repository;
 * - error handler.
 * @see AppSettings
 * @see Repository
 * @see ErrorHandler
 */
@Injectable()
export default class SettingsService {
    constructor(@InjectRepository(AppSettings) private readonly appSettings: Repository<AppSettings>, private readonly errorHandler: ErrorHandler) {}

    /**
     * Gets value from settings for client's Bitrix24 portal by its auth data.
     * @param auth - authentication data.
     * @param key - settings name/code.
     * @returns any - value from database. If AppSettings missed the `key` property returns undefined.
     * @see Auth
     * @see AppSettings
     */
    async getSettings(auth: Auth, key: keyof AppSettings) {
        return (await this.get(auth))?.[key];
    }

    /**
     * Stores value of settings for client's Bitrix24 portal by its auth data.
     * @param auth - authentication data.
     * @param key - settings name/code.
     * @param value - value to store.
     * @returns boolean - whether operation was successful.
     * @throws BadRequestException if AppSettings missed the `key` property.
     * @see Auth
     * @see AppSettings
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async saveSettings<K extends keyof AppSettings>(auth: Auth, key: K, value: AppSettings[K]): Promise<boolean> {
        if (key === 'id' || key === 'auth' || !Object.keys(new AppSettings(null)).includes(key)) {
            this.errorHandler.badRequest(auth, `Unexpected settings key: [${key}]`, 'settings.wrongKey', [key]);
        }

        const settings = (await this.get(auth)) ?? new AppSettings(auth);
        settings[key] = value;
        await this.save(auth, settings);
        return true;
    }

    /**
     * Gets settings for client's Bitrix24 portal by its auth data.
     * @param auth - authentication data.
     * @returns AppSettings - settings stored in database.
     * @throws InternalServerErrorException if database request failed.
     * @see Auth
     * @see AppSettings
     * @see Repository
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async get(auth: Auth) {
        try {
            return await this.appSettings.findOne({ where: { auth } });
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get settings', e });
        }
    }

    /**
     * Stores settings for client's Bitrix24 portal in database by auth data.
     * @param auth - authentication data.
     * @param settings - new settings to store.
     * @throws InternalServerErrorException if database request failed.
     * @see Auth
     * @see AppSettings
     * @see Repository
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async save(auth: Auth, settings: AppSettings): Promise<void> {
        try {
            await this.appSettings.save(settings);
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to save settings', e });
        }
    }
}
