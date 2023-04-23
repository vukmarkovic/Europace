import { ModuleMocker } from 'jest-mock';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import InstallationGuard from '../../../src/common/guards/installation.guard';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import { PlacementService } from '../../../src/modules/placement/placement.service';
import { PlacementModule } from '../../../src/modules/placement/placement.module';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

describe('SettingsController', () => {
    let app: INestApplication;
    let service: PlacementService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                PlacementModule,
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
        service = await app.get<PlacementService>(PlacementService);
    });

    it('PlacementService should be defined', () => {
        expect(service).toBeDefined();
    });

    it('GET /placement should return not found', () => {
        return request(app.getHttpServer()).get('/placement').expect(404);
    });

    it('POST /placement/update should call savePlacements handler', async () => {
        const handler = jest.spyOn(service, 'savePlacements').mockReturnValue(Promise.resolve(true));
        const response = await request(app.getHttpServer()).post('/placement/update')
        .send({auth: authMock, placements: [42]})
        .expect(201, 'true');

        expect(handler).toHaveBeenCalledWith(authMock, [42]);
        return response;
    });

    afterAll(async () => {
        await app.close();
    });
});
