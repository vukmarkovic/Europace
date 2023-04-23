import { Injectable } from '@nestjs/common';
import MatchingSeederService from './matching/matching.seeder.service';

/**
 * Service providing initial data seeding.
 * @see MatchingSeederService
 */
@Injectable()
export default class Seeder {
    constructor(private readonly matchingSeeder: MatchingSeederService) {}

    /**
     * seed default data
     */
    async seed() {
        await this.matching();
    }

    /**
     * seed default matching data
     */
    private async matching() {
        try {
            await this.matchingSeeder.seed();
        } catch (e) {
            console.log('Failed to seed matching');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    /**
     * clear default data
     */
    async clear() {
        await this.clearMatching();
    }

    /**
     * clear default matching data
     */
    private async clearMatching() {
        try {
            await this.matchingSeeder.clear();
        } catch (e) {
            console.log('Failed to clear matching');
            console.log(e.message);
            console.log(e.stack);
        }
    }
}
