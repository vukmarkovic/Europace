import { NestFactory } from '@nestjs/core';
import { SeederModule } from './database/seeders/seeder.module';
import Seeder from './database/seeders/seeder';

/**
 * Database seeding start script
 */
async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    try {
        const seeder = appContext.get(Seeder);
        await seeder.seed();
        console.log('Seeding complete!');
    } catch (e) {
        console.error('Seeding failed!');
        throw e;
    } finally {
        await appContext.close();
    }
}
bootstrap();
