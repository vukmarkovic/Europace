import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TaskModule } from '../../../src/modules/task/task.module';
import { TaskService } from '../../../src/modules/task/task.service';
import TaskHelper from '../../../src/modules/task/utils/task.helper';
import CredentialsTask from '../../../src/modules/task/tasks/credentials.task';
import { Task } from '../../../src/modules/task/models/entities/task.entity';
import TaskQueue from '../../../src/modules/task/models/entities/task.queue.entity';
import MatchingService from '../../../src/modules/matching/matching.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import EuropaceService from '../../../src/modules/europace/europace.service';
import CreateOrUpdateCaseTask from '../../../src/modules/task/tasks/createOrUpdateCase.task';
import GetCaseTask from '../../../src/modules/task/tasks/getCase.task';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('TaskModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TaskModule,
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

    it('MatchingService should be defined', () => {
        expect(app.get(MatchingService)).toBeInstanceOf(MatchingService);
    });

    it('EuropaceService should be defined', () => {
        expect(app.get(EuropaceService)).toBeInstanceOf(EuropaceService);
    });

    it('TaskService should be defined', () => {
        expect(app.get(TaskService)).toBeInstanceOf(TaskService);
    });

    it('TaskHelper should be defined', () => {
        expect(app.get(TaskHelper)).toBeInstanceOf(TaskHelper);
    });

    it('CredentialsTask should be defined', () => {
        expect(app.get(CredentialsTask)).toBeInstanceOf(CredentialsTask);
    });

    it('CreateOrUpdateCaseTask should be defined', () => {
        expect(app.get(CreateOrUpdateCaseTask)).toBeInstanceOf(CreateOrUpdateCaseTask);
    });

    it('GetCaseTask should be defined', () => {
        expect(app.get(GetCaseTask)).toBeInstanceOf(GetCaseTask);
    });

    it('Task repository should be defined', () => {
        expect(app.get(getRepositoryToken(Task))).toBeInstanceOf(Repository<Task>);
    });

    it('TaskQueue repository should be defined', () => {
        expect(app.get(getRepositoryToken(TaskQueue))).toBeInstanceOf(Repository<TaskQueue>);
    });

    afterAll(async () => {
        await app.close();
    });
});
