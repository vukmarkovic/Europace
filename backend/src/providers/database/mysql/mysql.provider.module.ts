import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Module providing global MySQL connection.
 * Configuration stored in .env files. Priority: .env.local, .env.prod, .env.dev. First found will be used.
 * @see ConfigService
 * @see TypeOrmModule
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.local', '.env.prod', '.env.dev'],
            expandVariables: true,
            isGlobal: true,
            //cache: true
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                synchronize: true,
                autoLoadEntities: true,
                logging: ['error'], //"query"
            }),
            inject: [ConfigService],
        }),
    ],
})
export default class MysqlProviderModule {}
