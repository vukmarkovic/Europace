import { Body, Controller, Get, HttpCode, Inject, Logger, Param, Post, Res } from '@nestjs/common';
import * as path from 'path';
import UpdateService from './modules/update/update.service';
import Profiler from './common/modules/profiler/profiler.service';
import IBxAuthData from './modules/bxapi/models/intefaces/bx.auth.data';

/**
 * Main application controller.
 * Provides endpoints:
 * - /app, /index, / - GET, stub tells that application is up.
 * - /app, /index, /install, / - POST, main endpoints returning frontend client index.
 * - /update - POST, install or update application handler.
 */
@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(@Inject(UpdateService) private readonly update: UpdateService, @Inject(Profiler) private readonly profiler: Profiler) {}

    @Get(['app', 'index', ''])
    hello() {
        return "Hello! I'm OK!";
    }

    @Post(['app', 'index', 'install', ''])
    @HttpCode(200)
    indexPage(@Res() response) {
        this.logger.log("App's main page requested");
        response.sendFile(path.resolve('./client/build/index.html'));
    }

    @Post('update')
    @HttpCode(200)
    async init(@Body() data: IBxAuthData) {
        return await this.profiler.wrap(
            'update',
            async () => {
                try {
                    return await this.update.handle(data);
                } catch (e) {
                    this.logger.error('Failed to handle update for ' + data.domain);
                    this.logger.error(e);
                }
            },
            data,
        );
    }

    @Get('lead/:id')
    lead(@Param('id') data: string, @Res() response) {
        const id = parseInt(data) || 0;
        response.sendFile(path.resolve(`./leads/lead_${id}.json`));
    }
}
