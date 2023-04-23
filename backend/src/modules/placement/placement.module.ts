import { Module } from '@nestjs/common';
import BxApiModule from '../bxapi/bx.api.module';
import SettingsModule from '../settings/settings.module';
import { PlacementController } from './placement.controller';
import { PlacementService } from './placement.service';

/**
 * Module that provides a service for working with the settings for placing the authorization button in SP.
 *
 * @see PlacementController
 * @see PlacementService
 * @see BxApiModule
 * @see SettingsModule
 */

@Module({
    imports: [BxApiModule, SettingsModule],
    exports: [PlacementService],
    controllers: [PlacementController],
    providers: [PlacementService],
})
export class PlacementModule {}
