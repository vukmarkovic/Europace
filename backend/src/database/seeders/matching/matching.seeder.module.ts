import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ApiField from '../../../modules/matching/models/entities/api.field.entity';
import DefaultMatching from '../../../modules/matching/models/entities/default.matching';
import MatchingSeederService from './matching.seeder.service';
import Matching from '../../../modules/matching/models/entities/matching.entity';
import { Auth } from '../../../common/modules/auth/model/entities/auth.entity';

/**
 * Module providing seeding of matching interface initial data.
 * @see MatchingSeederService
 * @see ApiField
 * @see DefaultMatching
 * @see Matching
 * @see Auth
 */
@Module({
    imports: [TypeOrmModule.forFeature([ApiField, DefaultMatching, Matching, Auth])],
    providers: [MatchingSeederService],
    exports: [MatchingSeederService],
})
export default class MatchingSeederModule {}
