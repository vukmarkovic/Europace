import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { EuropaceAuthService } from '../../../src/modules/europaceAuth/europaceAuth.service';
import { EuropaceAuthController } from '../../../src/modules/europaceAuth/europaceAuth.controller';
import EuropaceService from '../../../src/modules/europace/europace.service';
import MatchingService from '../../../src/modules/matching/matching.service';
import { EuropaceAuthModule } from '../../../src/modules/europaceAuth/europaceAuth.module';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('EuropaceAuthModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                EuropaceAuthModule,
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

    it('BxApiService should be defined', () => {
        expect(app.get(BxApiService)).toBeInstanceOf(BxApiService);
    });

    it('EuropaceAuthService should be defined', () => {
        expect(app.get(EuropaceAuthService)).toBeInstanceOf(EuropaceAuthService);
    });

    it('EuropaceAuthController should be defined', () => {
        expect(app.get(EuropaceAuthController)).toBeInstanceOf(EuropaceAuthController);
    });

    it('EuropaceService should be defined', () => {
        expect(app.get(EuropaceService)).toBeInstanceOf(EuropaceService);
    });

    it('MatchingService should be defined', () => {
        expect(app.get(MatchingService)).toBeInstanceOf(MatchingService);
    });

    afterAll(async () => {
        await app.close();
    });
});
