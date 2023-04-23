import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { PlacementModule } from '../../../src/modules/placement/placement.module';
import { PlacementService } from '../../../src/modules/placement/placement.service';
import { PlacementController } from '../../../src/modules/placement/placement.controller';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import SettingsService from '../../../src/modules/settings/settings.service';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('PlacementModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                PlacementModule,
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

    it('PlacementService should be defined', () => {
        expect(app.get(PlacementService)).toBeInstanceOf(PlacementService);
    });

    it('PlacementController should be defined', () => {
        expect(app.get(PlacementController)).toBeInstanceOf(PlacementController);
    });

    it('BxApiService should be defined', () => {
        expect(app.get(BxApiService)).toBeInstanceOf(BxApiService);
    });

    it('SettingsService should be defined', () => {
        expect(app.get(SettingsService)).toBeInstanceOf(SettingsService);
    });

    afterAll(async () => {
        await app.close();
    });
});
