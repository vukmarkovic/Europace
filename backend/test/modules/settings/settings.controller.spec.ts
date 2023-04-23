import { ModuleMocker } from 'jest-mock';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import SettingsModule from '../../../src/modules/settings/settings.module';
import InstallationGuard from '../../../src/common/guards/installation.guard';
import SettingsService from '../../../src/modules/settings/settings.service';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

describe('SettingsController', () => {
    let app: INestApplication;
    let service: SettingsService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                SettingsModule,
                ErrorHandler,
                TypeOrmModule.forRoot({
                    type: 'better-sqlite3',
                    database: ':memory:',
                    entities: [],
                }),
            ],
        })
            .overrideGuard(InstallationGuard)
            .useValue({
                canActivate: (context) => {
                    context.switchToHttp().getRequest().auth = authMock;
                    return true;
                },
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
        service = await app.get<SettingsService>(SettingsService);
    });

    it('SettingsService should be defined', () => {
        expect(service).toBeDefined();
    });

    it('GET /byKey should return not found', () => {
        return request(app.getHttpServer()).get('/settings/byKey').expect(404);
    });

    it('GET /byKey/:key should call get settings value handler', async () => {
        const handler = jest.spyOn(service, 'getSettings').mockReturnValue(Promise.resolve(42));
        const response = await request(app.getHttpServer()).get('/settings/byKey/key').expect(200, '42');

        expect(handler).toHaveBeenCalledWith(authMock, 'key');

        return response;
    });

    it('PUT /byKey should return not found', () => {
        return request(app.getHttpServer()).put('/settings/byKey').send({ value: 42 }).expect(404);
    });

    it('PUT /byKey/:key should call save settings handler', async () => {
        const handler = jest.spyOn(service, 'saveSettings');
        const response = await request(app.getHttpServer()).put('/settings/byKey/key').send({ value: 42 }).expect(204, '');

        expect(handler).toHaveBeenCalledWith(authMock, 'key', 42);

        return response;
    });

    afterAll(async () => {
        await app.close();
    });
});
