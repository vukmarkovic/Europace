import { Module } from '@nestjs/common';
import { BxApiService } from './bx.api.service';
import BxApiController from './bx.api.controller';

/**
 * Module providing Bitrix24 rest API integration service.
 * Also provides controller to handle requests to Bitrix24 API from frontend.
 * @see BxApiController
 * @see BxApiService
 */
@Module({
    exports: [BxApiService],
    providers: [BxApiService],
    controllers: [BxApiController],
})
export default class BxApiModule {}
