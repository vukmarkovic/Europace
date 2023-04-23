import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import MatchingService from '../../../src/modules/matching/matching.service';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import RobotService from '../../../src/modules/robot/robot.service';
import IBxRobotData from '../../../src/modules/robot/models/interfaces/bx.robot.data';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import RobotException from '../../../src/modules/robot/models/exceptions/robot.exception';
import MatchingEntityEnum from '../../../src/common/enums/matching.entity.enum';
import EuropaceService from '../../../src/modules/europace/europace.service';

jest.mock('@nestjs/common/services');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

const europaceMock = {};

const matchingMock = {
    get: jest.fn().mockReturnThis(),
    saveData: jest.fn().mockReturnThis(),
    prepareData: jest.fn().mockReturnThis(),
};

const bxMock = {
    getCRMMap: jest.fn().mockReturnThis(),
    getList: jest.fn().mockReturnThis(),
    callBXApi: jest.fn().mockReturnThis(),
};

describe('RobotService', () => {
    let service: RobotService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RobotService,
                ErrorHandler,
                {
                    provide: MatchingService,
                    useValue: matchingMock,
                },
                {
                    provide: EuropaceService,
                    useValue: europaceMock,
                },
                {
                    provide: BxApiService,
                    useValue: bxMock,
                },
                // {
                //    provide: CustomersTask,
                //    useValue: {
                //       process: jest.fn().mockReturnThis(),
                //    },
                // },
                // {
                //    provide: MembersTask,
                //    useValue: {
                //       process: jest.fn().mockReturnThis(),
                //    },
                // },
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
        service = await module.get<RobotService>(RobotService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('wrap', () => {
        it('should return callback result', () => {
            return expect(RobotService['wrap'](() => Promise.resolve(42))).resolves.toEqual(42);
        });
        it('should throw robot exception', () => {
            return expect(
                RobotService['wrap'](() => {
                    throw new Error('error');
                }),
            ).rejects.toThrowWithMessage(RobotException, 'error');
        });
    });

    describe('getSmartProcessData', () => {
        it('should return smart process id', () => {
            return expect(service['getSmartProcessData'](authMock, { document_id: ['string 1', 'string 2', 'DYNAMIC_24_42'] } as IBxRobotData)).toEqual({
                entityTypeId: '24',
                spId: '42',
            });
        });
        it('should throw bad request error', () => {
            expect(() => service['getSmartProcessData'](authMock, { document_id: ['string 1', 'string 2', 'string 3'] } as IBxRobotData)).toThrowWithMessage(
                BadRequestException,
                'Smart process ID expected but got: [string 1,string 2,string 3]',
            );

            expect(() =>
                service['getSmartProcessData'](authMock, { document_id: ['string 1', 'string 2', 'anystring_24_42'] } as IBxRobotData),
            ).toThrowWithMessage(BadRequestException, 'Smart process ID expected but got: [string 1,string 2,anystring_24_42]');

            expect(() =>
                service['getSmartProcessData'](authMock, { document_id: ['string 1', 'string 2', 'DYNAMIC_string_42'] } as IBxRobotData),
            ).toThrowWithMessage(BadRequestException, 'Smart process ID expected but got: [string 1,string 2,DYNAMIC_string_42]');

            expect(() =>
                service['getSmartProcessData'](authMock, { document_id: ['string 1', 'string 2', 'DYNAMIC_24_string'] } as IBxRobotData),
            ).toThrowWithMessage(BadRequestException, 'Smart process ID expected but got: [string 1,string 2,DYNAMIC_24_string]');

            expect(() =>
                service['getSmartProcessData'](authMock, { document_id: ['string 1', 'string 2', 'DYNAMIC-24-42'] } as IBxRobotData),
            ).toThrowWithMessage(BadRequestException, 'Smart process ID expected but got: [string 1,string 2,DYNAMIC-24-42]');
        });
    });

    describe('getContactId', () => {
        it('should return smart process id', () => {
            return expect(service['getContactId'](authMock, { document_id: ['string 1', 'string 2', 'CONTACT_42'] } as IBxRobotData)).toEqual('42');
        });
        it('should throw bad request error', () => {
            expect(() => service['getContactId'](authMock, { document_id: ['string 1', 'string 2', 'string 3'] } as IBxRobotData)).toThrowWithMessage(
                BadRequestException,
                'Contact ID expected but got: [string 1,string 2,string 3]',
            );

            expect(() => service['getContactId'](authMock, { document_id: ['string 1', 'string 2', 'anystring_42'] } as IBxRobotData)).toThrowWithMessage(
                BadRequestException,
                'Contact ID expected but got: [string 1,string 2,anystring_42]',
            );

            expect(() => service['getContactId'](authMock, { document_id: ['string 1', 'string 2', 'CONTACT_string'] } as IBxRobotData)).toThrowWithMessage(
                BadRequestException,
                'Contact ID expected but got: [string 1,string 2,CONTACT_string]',
            );

            expect(() => service['getContactId'](authMock, { document_id: ['string 1', 'string 2', 'CONTACT-42'] } as IBxRobotData)).toThrowWithMessage(
                BadRequestException,
                'Contact ID expected but got: [string 1,string 2,CONTACT-42]',
            );
        });
    });

    describe('handleError', () => {
        it('should throw error', async () => {
            await expect(
                service['handleError'](authMock, new RobotException('robot error'), '42', {
                    code: 'robot code',
                    document_type: ['string1', 'string2', 'string3'],
                } as IBxRobotData),
            ).rejects.toThrowWithMessage(InternalServerErrorException, `[robot code] failed`);

            // expect(callMock).toHaveBeenCalledWith(authMock, {
            //     method: 'crm.timeline.comment.add',
            //     data: {
            //         fields: {
            //             ENTITY_ID: '42',
            //             ENTITY_TYPE: 'string3',
            //             COMMENT: '[Turista ROBOT]: robot error',
            //         },
            //     },
            // });
        });
        it('should throw internal error', async () => {
            const callMock = jest.spyOn(bxMock, 'callBXApi');
            await expect(service['handleError'](authMock, new Error('error'), '42', { code: 'robot code' } as IBxRobotData)).rejects.toThrowWithMessage(
                InternalServerErrorException,
                '[robot code] failed',
            );
            expect(callMock).not.toBeCalled();
        });
    });

    describe('checkRobot', () => {
        it('should pass', () => {
            const logMock = jest.spyOn(service['logger'], 'debug');
            service['checkRobot']({ code: 'code', auth: {} } as IBxRobotData, 'code');
            expect(logMock).toHaveBeenCalledOnce();
        });
        it('should throw error', () => {
            const logMock = jest.spyOn(service['logger'], 'debug');
            expect(() => service['checkRobot']({ code: 'wrong code', auth: {} } as IBxRobotData, 'code')).toThrowWithMessage(
                BadRequestException,
                'Unexpected robot: [code] expected, but got [wrong code]',
            );
            expect(logMock).not.toHaveBeenCalled();
        });
    });

    describe('requiredFieldsMissing', () => {
        it('should return false', async () => {
            const saveMock = jest.spyOn(service['helper'], 'saveError');
            const item = {
                field1: 1,
                field2: 'asd',
                filed3: '',
                filed4: 0,
                filed5: undefined,
                LastAPIResponseCode: '',
                LastAPIResponseMessage: '',
            };
            await expect(service['requiredFieldsMissing'](authMock, MatchingEntityEnum.CUSTOMER, item, 'field1', 'field2')).resolves.toEqual(false);

            expect(saveMock).not.toBeCalled();
        });
        it('should save field error', async () => {
            const saveMock = jest.spyOn(service['helper'], 'saveError');
            const item = {
                CUSTOMER: 42,
                field: null,
                LastAPIResponseCode: '',
                LastAPIResponseMessage: '',
            };
            await expect(service['requiredFieldsMissing'](authMock, MatchingEntityEnum.CUSTOMER, item, 'field')).resolves.toEqual(true);

            expect(saveMock).toHaveBeenCalledWith(authMock, MatchingEntityEnum.CUSTOMER, 42, 'Required data empty: field', 400);
        });
        it('should save some fields error', async () => {
            const saveMock = jest.spyOn(service['helper'], 'saveError');
            const item = {
                CUSTOMER: 42,
                field1: undefined,
                field2: 0,
                field3: '',
                field4: null,
                LastAPIResponseCode: '',
                LastAPIResponseMessage: '',
            };
            await expect(service['requiredFieldsMissing'](authMock, MatchingEntityEnum.CUSTOMER, item, 'field1', 'field2', 'field3')).resolves.toEqual(true);

            expect(saveMock).toHaveBeenCalledWith(authMock, MatchingEntityEnum.CUSTOMER, 42, 'Required data empty: field1, field2, field3', 400);
        });
    });

    describe('testRobot', () => {
        it('should throw error', () => {
            return expect(() => service['test']({ code: 'wrong code', auth: {} } as IBxRobotData)).rejects.toThrowWithMessage(
                BadRequestException,
                'Unexpected robot: [test] expected, but got [wrong code]',
            );
        });
        it('should log data', async () => {
            const logMock = jest.spyOn(service['logger'], 'debug');
            await expect(service['test']({ code: 'test', auth: {} } as IBxRobotData)).toResolve();
            expect(logMock).toHaveBeenCalledOnce();
        });
    });
});
