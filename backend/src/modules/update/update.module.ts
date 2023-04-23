import { Module } from '@nestjs/common';
import UpdateService from './update.service';
import BxApiModule from '../bxapi/bx.api.module';
import { MatchingModule } from '../matching/matching.module';

/**
 * Module providing service to handle clients Bitrix24 portals updates.
 * @see AuthModule
 * @see BxApiModule
 * @see MatchingModule
 */
@Module({
    imports: [BxApiModule, MatchingModule],
    exports: [UpdateService],
    providers: [UpdateService],
})
export class UpdateModule {}
