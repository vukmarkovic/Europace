import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ModuleMocker } from 'jest-mock';
import { TypeOrmModule } from '@nestjs/typeorm';
import DefaultMatching from '../../../src/modules/matching/models/entities/default.matching';
import MatchingService from '../../../src/modules/matching/matching.service';
import Matching from '../../../src/modules/matching/models/entities/matching.entity';
import ApiField from '../../../src/modules/matching/models/entities/api.field.entity';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { MatchingModule } from '../../../src/modules/matching/matching.module';
import InstallationGuard from '../../../src/common/guards/installation.guard';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('MatchingController', () => {
    let app: INestApplication;
    const matchingServiceMock = {
        getFields: () => ['fields'],
        saveFields: () => jest.fn().mockReturnThis(),
    };

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MatchingModule,
                TypeOrmModule.forRoot({
                    type: 'better-sqlite3',
                    database: ':memory:',
                    dropSchema: true,
                    entities: [Auth, ApiField, Matching, DefaultMatching],
                    synchronize: true,
                }),
            ],
        })
            .overrideProvider(MatchingService)
            .useValue(matchingServiceMock)
            .overrideGuard(InstallationGuard)
            .useValue({
                canActivate: () => true,
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

    it(`/GET /matching`, async () => {
        return request(app.getHttpServer()).get('/matching').expect(404);
    });

    it(`/GET /matching/:entity`, async () => {
        const getMock = jest.spyOn(matchingServiceMock, 'getFields');
        const response = await request(app.getHttpServer()).get('/matching/some-entity').expect(200).expect(['fields']);

        expect(getMock).toHaveBeenCalledWith(undefined, 'some-entity');

        return response;
    });

    it(`/PUT /matching`, async () => {
        return request(app.getHttpServer()).put('/matching').send(['data array']).expect(404);
    });

    it(`/PUT /matching/:entity`, async () => {
        const saveMock = jest.spyOn(matchingServiceMock, 'saveFields');
        const response = await request(app.getHttpServer()).put('/matching/some-entity').send(['data array']).expect(204).expect({});

        expect(saveMock).toHaveBeenCalledWith(undefined, 'some-entity', ['data array']);

        return response;
    });

    afterAll(async () => {
        await app.close();
    });
});
