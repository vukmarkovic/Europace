import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import BxApiModule from '../../../src/modules/bxapi/bx.api.module';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import BxApiController from '../../../src/modules/bxapi/bx.api.controller';
import { AuthService } from '../../../src/common/modules/auth/auth.service';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('BxApiModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                BxApiModule,
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

    it('BxApiController should be defined', () => {
        expect(app.get(BxApiController)).toBeInstanceOf(BxApiController);
    });

    it('AuthService should be defined', () => {
        expect(app.get(AuthService)).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
