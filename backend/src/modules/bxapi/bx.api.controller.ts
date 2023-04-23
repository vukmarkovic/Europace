import { Body, Controller, Get, HttpCode, Inject, InternalServerErrorException, Logger, Post, UseGuards } from '@nestjs/common';
import Profiler from '../../common/modules/profiler/profiler.service';
import { BxApiService } from './bx.api.service';
import { AuthService } from '../../common/modules/auth/auth.service';
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';
import IBxUser from './models/intefaces/bx.user';
import IBxAuthData from './models/intefaces/bx.auth.data';
import InstallationGuard from '../../common/guards/installation.guard';
import Auth from '../../common/decorators/auth.decorator';
import { Auth as AuthEntity } from '../../common/modules/auth/model/entities/auth.entity';

/**
 * Bitrix24 rest API integration controller.
 *
 * Endpoints:
 * - /bx/handleInstall - POST, application installation handler;
 * - /bx/uninstall - POST, application uninstallation handler;
 * - /bx/callMethod - POST, single Bitrix24 rest API call handler;
 * - /bx/callBatch - POST, Bitrix24 rest API batch call handler;
 * - /bx/getList - POST, single Bitrix24 rest API call handler, used for list methods only;
 * - /bx/auth - GET, returns current authentication data;
 * - /bx/auth - POST, update current authentication data handler.
 *
 * Use guard to identify client's portal.
 *
 * Use profiler to log execution duration.
 * @see InstallationGuard
 * @see AuthService
 * @see BxApiService
 * @see ErrorHandler
 * @see Profiler
 */
@Controller('bx')
export default class BxApiController {
    private readonly logger = new Logger(BxApiController.name);

    constructor(
        @Inject(AuthService) private readonly auth: AuthService,
        @Inject(BxApiService) private readonly bxApi: BxApiService,
        @Inject(ErrorHandler) private readonly errorHandler: ErrorHandler,
        @Inject(Profiler) private readonly profiler: Profiler,
    ) {}

    @Post('handleInstall')
    async handleInstall(@Body() body: any) {
        if (!body.auth?.application_token) {
            throw new InternalServerErrorException('App token missing');
        }

        const auth = await this.auth.getByMemberId(body.auth.member_id);
        if (!auth) {
            this.errorHandler.internal({
                auth: body.auth,
                message: 'Attempted to handle non-existent installation',
                payload: {
                    requestBody: JSON.stringify(body),
                },
            });
        }

        auth.member_id = body.auth.member_id;
        auth.app_token = body.auth.application_token;
        auth.auth_token = body.auth.access_token;
        auth.refresh_token = body.auth.refresh_token;
        auth.expires = parseInt(body.auth.expires) * 1000;
        auth.active = true;
        await this.auth.save(auth);

        return 'SUCCESS';
    }

    @Post('uninstall')
    @HttpCode(200)
    async uninstall(@Body() body: any) {
        await this.profiler.wrap(
            'uninstall',
            async () => {
                const config = await this.auth.getByToken(body.auth.application_token);
                if (!config) {
                    this.logger.error('Config not found by application token for: ' + body.auth.application_token);
                    return;
                }

                config.active = false;
                config.auth_token = null;
                config.refresh_token = null;
                config.expires = 0;

                await this.auth.save(config);

                this.logger.debug('App deleted for: ' + body.auth.application_token);
            },
            body,
        );
    }

    @Post('callMethod')
    @UseGuards(InstallationGuard)
    @HttpCode(200)
    async callMethod(@Auth() auth: AuthEntity, @Body() body): Promise<any> {
        return this.profiler.wrap(
            'execute method with bitrix API',
            async () => {
                try {
                    return await this.bxApi.callBXApi(auth, body);
                } catch (e) {
                    throw new InternalServerErrorException(e);
                }
            },
            body,
        );
    }

    @Post('callBatch')
    @UseGuards(InstallationGuard)
    @HttpCode(200)
    async callBatch(@Auth() auth: AuthEntity, @Body() body): Promise<any> {
        return this.profiler.wrap(
            'excute batch with bitrix API',
            async () => {
                try {
                    return await this.bxApi.callBXBatch(auth, body);
                } catch (e) {
                    throw new InternalServerErrorException(e);
                }
            },
            body,
        );
    }

    @Post('getList')
    @UseGuards(InstallationGuard)
    @HttpCode(200)
    async getList(@Auth() auth: AuthEntity, @Body() body): Promise<any> {
        return this.profiler.wrap(
            'get list from bitrix API',
            async () => {
                try {
                    return await this.bxApi.getList(auth, body);
                } catch (e) {
                    throw new InternalServerErrorException(e);
                }
            },
            body,
        );
    }

    @Get('auth')
    @UseGuards(InstallationGuard)
    async getAuth(@Auth() auth: AuthEntity): Promise<IBxUser | null> {
        try {
            return (await this.bxApi.callBXApi<IBxUser>(auth, { method: 'user.current', data: {} })).data;
        } catch (e) {
            this.logger.error({ message: 'Failed to get current auth', domain: auth.domain, member_id: auth.member_id });
        }

        return null;
    }

    @Post('auth')
    @HttpCode(200)
    async updateAuth(@Body() authData: IBxAuthData) {
        const auth = await this.auth.update(authData);
        return (await this.bxApi.callBXApi<IBxUser>(auth, { method: 'user.current', data: {} })).data;
    }
}
