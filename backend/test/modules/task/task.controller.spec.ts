import { ModuleMocker } from 'jest-mock';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import InstallationGuard from '../../../src/common/guards/installation.guard';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import { TaskService } from '../../../src/modules/task/task.service';
import { TaskModule } from '../../../src/modules/task/task.module';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

describe('TaskController', () => {
    let app: INestApplication;
    let service: TaskService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TaskModule,
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
        await app.init();
        service = await app.get<TaskService>(TaskService);
    });

    it('TaskService should be defined', () => {
        expect(service).toBeDefined();
    });

    it('GET should call list tasks handler', async () => {
        const handler = jest.spyOn(service, 'listTasks').mockReturnValue(Promise.resolve([]));
        const response = await request(app.getHttpServer()).get('/task').expect(200, []);

        expect(handler).toHaveBeenCalledWith(authMock);

        return response;
    });

    it('POST should call update task handler', async () => {
        const handler = jest.spyOn(service, 'updateTask').mockReturnValue(Promise.resolve(42));
        const response = await request(app.getHttpServer()).post('/task').send({ type: 'STUB' }).expect(201, '42');

        expect(handler).toHaveBeenCalledWith(authMock, { type: 'STUB' });

        return response;
    });

    it('GET /:type should call queue task handler', async () => {
        const handler = jest.spyOn(service, 'queueTask').mockReturnValue(Promise.resolve('PENDING'));
        const response = await request(app.getHttpServer()).get('/task/STUB').expect(200, 'PENDING');

        expect(handler).toHaveBeenCalledWith(authMock, 'STUB');

        return response;
    });

    afterAll(async () => {
        await app.close();
    });
});
