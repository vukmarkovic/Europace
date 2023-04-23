import { ModuleMocker } from 'jest-mock';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import InstallationGuard from '../../../src/common/guards/installation.guard';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import { EuropaceAuthService } from '../../../src/modules/europaceAuth/europaceAuth.service';
import { EuropaceAuthModule } from '../../../src/modules/europaceAuth/europaceAuth.module';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

describe('SettingsController', () => {
    let app: INestApplication;
    let service: EuropaceAuthService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                EuropaceAuthModule,
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
        service = await app.get<EuropaceAuthService>(EuropaceAuthService);
    });

    it('EuropaceAuthService should be defined', () => {
        expect(service).toBeDefined();
    });

    it('GET /europace should return not found', () => {
        return request(app.getHttpServer()).get('/europace').expect(404);
    });

    it('POST /europace/silentSignIn should call getUrl handler', async () => {
        const handler = jest.spyOn(service, 'getUrl').mockReturnValue(Promise.resolve("url"));
        const response = await request(app.getHttpServer()).post('/europace/silentSignIn')
        .send({auth: authMock, entityId: 42, entityTypeId: 42, access_token: 'access_token' })
        .expect(201, 'url');

        expect(handler).toHaveBeenCalledWith(authMock, 42, 42, 'access_token');
        return response;
    });

    afterAll(async () => {
        await app.close();
    });
});
