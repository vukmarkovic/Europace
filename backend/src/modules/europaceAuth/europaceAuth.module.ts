import { Module } from '@nestjs/common';
import BxApiModule from '../bxapi/bx.api.module';
import EuropaceModule from '../europace/europace.module';
import { MatchingModule } from '../matching/matching.module';
import { TaskModule } from '../task/task.module';
import { EuropaceAuthController } from './europaceAuth.controller';
import { EuropaceAuthService } from './europaceAuth.service';

/**
 * Module providing Europace auth service.
 *
 * @see EuropaceAuthController
 * @see EuropaceAuthService
 * @see BxApiModule
 * @see MatchingModule
 * @see EuropaceModule
 * @see TaskModule
 */
@Module({
    imports: [BxApiModule, MatchingModule, EuropaceModule, TaskModule],
    exports: [EuropaceAuthService],
    controllers: [EuropaceAuthController],
    providers: [EuropaceAuthService],
})
export class EuropaceAuthModule {}
