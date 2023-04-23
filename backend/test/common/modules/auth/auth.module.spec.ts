import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import AuthModule from '../../../../src/common/modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../../../../src/common/modules/auth/auth.service';

const moduleMocker = new ModuleMocker(global);

describe('AuthModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AuthModule,
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
        app.useLogger(false);
        await app.init();
    });

    it('AuthService should be defined', () => {
        expect(app.get(AuthService)).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
