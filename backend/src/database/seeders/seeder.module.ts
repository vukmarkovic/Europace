import MysqlProviderModule from '../../providers/database/mysql/mysql.provider.module';
import MatchingSeederModule from './matching/matching.seeder.module';
import { Module } from '@nestjs/common';
import Seeder from './seeder';

/**
 * Module providing seeding of initial application data.
 * Uses database.
 * @see Seeder
 * @see MatchingSeederModule
 * @see MysqlProviderModule
 */
@Module({
    imports: [MysqlProviderModule, MatchingSeederModule],
    providers: [Seeder],
})
export class SeederModule {}
