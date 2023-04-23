import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import SettingsModule from '../../../src/modules/settings/settings.module';
import SettingsService from '../../../src/modules/settings/settings.service';
import SettingsController from '../../../src/modules/settings/settings.controller';
import { Repository } from 'typeorm';
import AppSettings from '../../../src/modules/settings/models/entities/app.settings.entity';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('SettingsModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                SettingsModule,
                TypeOrmModule.forRoot({
                    type: 'better-sqlite3',
                    database: ':memory:',
                }),
            ],
        })
            .useMocker((token) => {
                if (token?.toString().includes('Repository')) {
                    return {};
                }
                if (typeof token === 'function') {
                    const mockMetadata = moduleMocker.getMetadata(token);
                    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                    return new Mock();
                }
            })
            .compile();

        app = module.createNestApplication();
        await app.init();
    });

    it('SettingsService should be defined', () => {
        expect(app.get(SettingsService)).toBeInstanceOf(SettingsService);
    });

    it('SettingsController should be defined', () => {
        expect(app.get(SettingsController)).toBeInstanceOf(SettingsController);
    });

    it('AppSettings repository should be defined', () => {
        expect(app.get(getRepositoryToken(AppSettings))).toBeInstanceOf(Repository<AppSettings>);
    });

    afterAll(async () => {
        await app.close();
    });
});
