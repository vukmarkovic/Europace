import { ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import RobotModule from '../../../src/modules/robot/robot.module';
import RobotService from '../../../src/modules/robot/robot.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import MatchingService from '../../../src/modules/matching/matching.service';
import EuropaceService from '../../../src/modules/europace/europace.service';
import TaskHelper from '../../../src/modules/task/utils/task.helper';
import RobotController from '../../../src/modules/robot/robot.controller';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);

describe('RobotModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                RobotModule,
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
        expect(app.get(BxApiService)).toBeDefined();
    });

    it('EuropaceService should be defined', () => {
        expect(app.get(EuropaceService)).toBeDefined();
    });

    it('MatchingService should be defined', () => {
        expect(app.get(MatchingService)).toBeDefined();
    });

    //    it('CustomersTask should be defined', () => {
    //       expect(app.get(CustomersTask)).toBeDefined()
    //    })

    //    it('OrdersTask should be defined', () => {
    //       expect(app.get(OrdersTask)).toBeDefined()
    //    })

    //    it('ConfirmationsTask should be defined', () => {
    //       expect(app.get(ConfirmationsTask)).toBeDefined()
    //    })

    //    it('MembersTask should be defined', () => {
    //       expect(app.get(MembersTask)).toBeDefined()
    //    })

    //    it('TravelTask should be defined', () => {
    //       expect(app.get(TravelTask)).toBeDefined()
    //    })

    it('TaskHelper should be defined', () => {
        expect(app.get(TaskHelper)).toBeDefined();
    });

    it('RobotController should be defined', () => {
        expect(app.get(RobotController)).toBeDefined();
    });

    it('RobotService should be defined', () => {
        expect(app.get(RobotService)).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
