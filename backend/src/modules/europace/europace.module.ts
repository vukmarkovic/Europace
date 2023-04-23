import { Module } from '@nestjs/common';
import EuropaceService from './europace.service';

/**
 * Module providing Europace API integration service.
 *
 * @see EuropaceService
 */
@Module({
    imports: [],
    controllers: [],
    providers: [EuropaceService],
    exports: [EuropaceService],
})
export default class EuropaceModule {}
