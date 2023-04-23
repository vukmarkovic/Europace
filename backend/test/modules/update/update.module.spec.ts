import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { UpdateModule } from '../../../src/modules/update/update.module';
import UpdateService from '../../../src/modules/update/update.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import MatchingService from '../../../src/modules/matching/matching.service';
import { AuthService } from '../../../src/common/modules/auth/auth.service';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('UpdateModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                UpdateModule,
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

    it('UpdateService should be defined', () => {
        expect(app.get(UpdateService)).toBeInstanceOf(UpdateService);
    });

    it('BxApiService should be defined', () => {
        expect(app.get(BxApiService)).toBeInstanceOf(BxApiService);
    });

    it('MatchingService should be defined', () => {
        expect(app.get(MatchingService)).toBeInstanceOf(MatchingService);
    });

    it('AuthService should be defined', () => {
        expect(app.get(AuthService)).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
