import { ModuleMocker } from 'jest-mock';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import InstallationGuard from '../../../src/common/guards/installation.guard';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import BxApiModule from '../../../src/modules/bxapi/bx.api.module';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import { AuthService } from '../../../src/common/modules/auth/auth.service';
import AuthModule from '../../../src/common/modules/auth/auth.module';
import ProfilerModule from '../../../src/common/modules/profiler/profiler.module';
import { WINSTON_MODULE_PROVIDER, WinstonModule } from 'nest-winston';
import BxApiResult from '../../../src/modules/bxapi/models/bx.api.result';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

jest.mock('@nestjs/common/services/logger.service');
describe('BxApiController', () => {
    let app: INestApplication;
    let bxService: BxApiService;
    let authService: AuthService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                BxApiModule,
                AuthModule,
                ProfilerModule,
                ErrorHandler,
                TypeOrmModule.forRoot({
                    type: 'better-sqlite3',
                    database: ':memory:',
                    entities: [],
                }),
                WinstonModule.forRoot({}),
            ],
        })
            .overrideGuard(InstallationGuard)
            .useValue({
                canActivate: (context) => {
                    context.switchToHttp().getRequest().auth = authMock;
                    return true;
                },
            })
            .overrideProvider(WINSTON_MODULE_PROVIDER)
            .useValue({
                debug: jest.fn(),
                profile: jest.fn(),
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
        bxService = await app.get<BxApiService>(BxApiService);
        authService = await app.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /handleInstall should throw internal error', async () => {
        await request(app.getHttpServer()).post('/bx/handleInstall').send({}).expect(500);

        await request(app.getHttpServer()).post('/bx/handleInstall').send({ auth: {} }).expect(500);

        jest.spyOn(authService, 'getByMemberId').mockReturnValueOnce(Promise.resolve(null));
        await request(app.getHttpServer())
            .post('/bx/handleInstall')
            .send({ auth: { application_token: ' app_token', member_id: 'member_id' } })
            .expect(500);
    });

    it('POST /handleInstall should call auth save handler', async () => {
        jest.spyOn(authService, 'getByMemberId').mockReturnValueOnce(Promise.resolve(authMock));
        const saveMock = jest.spyOn(authService, 'save');

        const payload = {
            auth: {
                member_id: 'member_id_data',
                application_token: 'application_token_data',
                access_token: 'access_token_data',
                refresh_token: 'refresh_token_data',
                expires: '12345',
            },
        };

        const data = {
            ...authMock,
            member_id: 'member_id_data',
            app_token: 'application_token_data',
            auth_token: 'access_token_data',
            refresh_token: 'refresh_token_data',
            expires: 12345000,
            active: true,
        };

        await request(app.getHttpServer()).post('/bx/handleInstall').send(payload).expect(201, 'SUCCESS');

        expect(saveMock).toHaveBeenCalledWith(data);
    });

    it('POST /uninstall should return if empty app_token', async () => {
        jest.spyOn(authService, 'getByToken').mockReturnValueOnce(Promise.resolve(null));
        const saveMock = jest.spyOn(authService, 'save');

        await request(app.getHttpServer())
            .post('/bx/uninstall')
            .send({ auth: { application_token: 'token' } })
            .expect(200);

        expect(saveMock).not.toBeCalled();
    });

    it('POST /uninstall should call deactivate handler', async () => {
        jest.spyOn(authService, 'getByToken').mockReturnValueOnce(Promise.resolve(authMock));
        const saveMock = jest.spyOn(authService, 'save');

        await request(app.getHttpServer())
            .post('/bx/uninstall')
            .send({ auth: { application_token: 'token' } })
            .expect(200);

        expect(saveMock).toHaveBeenCalledWith({
            ...authMock,
            active: false,
            auth_token: null,
            refresh_token: null,
            expires: 0,
        });
    });

    it('POST /callMethod should throw internal error', () => {
        jest.spyOn(bxService, 'callBXApi').mockImplementationOnce(() => {
            throw 'error';
        });
        return request(app.getHttpServer()).post('/bx/callMethod').expect(500);
    });

    it('POST /callMethod should call callMethod handler', async () => {
        const mock = jest.spyOn(bxService, 'callBXApi').mockReturnValueOnce(Promise.resolve(null));
        await request(app.getHttpServer()).post('/bx/callMethod').expect(200);
        expect(mock).toHaveBeenCalled();
    });

    it('POST /callBatch should throw internal error', () => {
        jest.spyOn(bxService, 'callBXBatch').mockImplementationOnce(() => {
            throw 'error';
        });
        return request(app.getHttpServer()).post('/bx/callBatch').expect(500);
    });

    it('POST /callBatch should call callMethod handler', async () => {
        const mock = jest.spyOn(bxService, 'callBXBatch');
        await request(app.getHttpServer()).post('/bx/callBatch').expect(200);
        expect(mock).toHaveBeenCalled();
    });

    it('POST /getList should throw internal error', () => {
        jest.spyOn(bxService, 'getList').mockImplementationOnce(() => {
            throw 'error';
        });
        return request(app.getHttpServer()).post('/bx/getList').expect(500);
    });

    it('POST /getList should call callMethod handler', async () => {
        const mock = jest.spyOn(bxService, 'getList').mockReturnValueOnce(Promise.resolve(null));
        await request(app.getHttpServer()).post('/bx/getList').expect(200);
        expect(mock).toHaveBeenCalled();
    });

    it('GET /auth should return null', () => {
        jest.spyOn(bxService, 'callBXApi').mockImplementationOnce(() => {
            throw 'error';
        });
        return request(app.getHttpServer()).get('/bx/auth').expect(200, {});
    });

    it('GET /auth should return user', () => {
        const user = new BxApiResult();
        user.data = { ID: 42 };
        jest.spyOn(bxService, 'callBXApi').mockReturnValueOnce(Promise.resolve(user));
        return request(app.getHttpServer()).get('/bx/auth').expect(200, { ID: 42 });
    });

    it('POST /auth should call update auth handler', async () => {
        const updateMock = jest.spyOn(authService, 'update').mockImplementationOnce(() => Promise.resolve(authMock));
        const bxMock = jest.spyOn(bxService, 'callBXApi').mockImplementationOnce(() => Promise.resolve({ data: null } as unknown as BxApiResult<any>));

        await request(app.getHttpServer()).post('/bx/auth').expect(200);

        expect(updateMock).toHaveBeenCalled();
        expect(bxMock).toHaveBeenCalled();
    });

    afterAll(async () => {
        await app.close();
    });
});
