import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ApiField from './models/entities/api.field.entity';
import MatchingService from './matching.service';
import Matching from './models/entities/matching.entity';
import { MatchingController } from './matching.controller';
import DefaultMatching from './models/entities/default.matching';
import BxApiModule from '../bxapi/bx.api.module';

/**
 * Module providing matching interface configuration.
 *
 * Provides:
 * - controller for configuring matching fields;
 * - service to read Bitrix24 dat as external API instances and write external API data to Bitrix24 portal;
 * - repositories of fields, matches and default matching.
 *
 * Uses Bitrix24 API integration.
 *
 * @see MatchingController
 * @see MatchingService
 * @see ApiField
 * @see Matching
 * @see DefaultMatching
 * @see BxApiModule
 */
@Module({
    imports: [BxApiModule, TypeOrmModule.forFeature([ApiField, Matching, DefaultMatching])],
    exports: [MatchingService],
    controllers: [MatchingController],
    providers: [MatchingService],
})
export class MatchingModule {}
