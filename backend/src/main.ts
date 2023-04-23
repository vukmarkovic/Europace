import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';

/**
 * Application start script
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'debug'],
    });
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    const configService = app.get(ConfigService);
    await app.listen(configService.get('APP_PORT'));
}
bootstrap();
