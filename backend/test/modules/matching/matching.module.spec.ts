import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MatchingModule } from '../../../src/modules/matching/matching.module';
import { MatchingController } from '../../../src/modules/matching/matching.controller';
import MatchingService from '../../../src/modules/matching/matching.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import ApiField from '../../../src/modules/matching/models/entities/api.field.entity';
import Matching from '../../../src/modules/matching/models/entities/matching.entity';
import DefaultMatching from '../../../src/modules/matching/models/entities/default.matching';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('MatchingModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MatchingModule,
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

    it('MatchingService should be defined', () => {
        expect(app.get(MatchingService)).toBeInstanceOf(MatchingService);
    });

    it('MatchingController should be defined', () => {
        expect(app.get(MatchingController)).toBeInstanceOf(MatchingController);
    });

    it('BxApiService should be defined', () => {
        expect(app.get(BxApiService)).toBeInstanceOf(BxApiService);
    });

    it('ApiField repository should be defined', () => {
        expect(app.get(getRepositoryToken(ApiField))).toBeInstanceOf(Repository<ApiField>);
    });

    it('Matching repository should be defined', () => {
        expect(app.get(getRepositoryToken(Matching))).toBeInstanceOf(Repository<Matching>);
    });

    it('DefaultMatching repository should be defined', () => {
        expect(app.get(getRepositoryToken(DefaultMatching))).toBeInstanceOf(Repository<DefaultMatching>);
    });

    afterAll(async () => {
        await app.close();
    });
});
