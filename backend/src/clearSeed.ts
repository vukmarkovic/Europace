import { NestFactory } from '@nestjs/core';
import { SeederModule } from './database/seeders/seeder.module';
import Seeder from './database/seeders/seeder';

/**
 * Database seeding clear script
 */
async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    try {
        const seeder = appContext.get(Seeder);
        await seeder.clear();
        console.log('Clearing seed complete!');
    } catch (e) {
        console.error('Clearing Seed failed!');
        throw e;
    } finally {
        await appContext.close();
    }
}
bootstrap();
