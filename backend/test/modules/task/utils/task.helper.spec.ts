import { Auth } from '../../../../src/common/modules/auth/model/entities/auth.entity';
import TaskHelper from '../../../../src/modules/task/utils/task.helper';
import { Test, TestingModule } from '@nestjs/testing';
import MatchingService from '../../../../src/modules/matching/matching.service';
import MatchingEntityEnum from '../../../../src/common/enums/matching.entity.enum';
import MatchException from '../../../../src/modules/matching/models/exceptions/match.exception';
import FieldDto from '../../../../src/modules/matching/models/dto/field.dto';
import { IApiResponseFields } from '../../../../src/modules/matching/models/interfaces/api.response.fields';
import ErrorHandlerModule from '../../../../src/common/modules/errorhandler/error.handler.module';
import { BxApiService } from '../../../../src/modules/bxapi/bx.api.service';
import EuropaceService from '../../../../src/modules/europace/europace.service';
import { IEuropaceLeadMatching } from '../../../../src/modules/europace/models/interfaces/matching/europace.lead.matching';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('@nestjs/common/services/logger.service');
const authMock = {
    id: 1,
    domain: 'domaain.test',
} as Auth;

const matchingMock = {
    get: jest.fn().mockReturnThis(),
    saveData: jest.fn().mockReturnThis(),
    checkParent: jest.fn(),
    prepareData: jest.fn().mockResolvedValue({
        url: 'c_url',
        password: 'c_password',
        username: 'c_username',
        partnerId: 'c_partnerId'
    }),
};

const bxApiMock = {
    getList: jest.fn().mockReturnValue({ data: [{ id: 'europace' }] })
};

const europaceMock = {
    getToken: jest.fn().mockResolvedValue({
        access_token: 'access token',
        other: 'some data'
    })
};

describe('TaskHelper', () => {
    let helper: TaskHelper;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ErrorHandlerModule],
            providers: [
                TaskHelper,
                { provide: MatchingService, useValue: matchingMock },
                { provide: BxApiService, useValue: bxApiMock },
                { provide: EuropaceService, useValue: europaceMock },
            ],
        }).compile();
        helper = await module.get<TaskHelper>(TaskHelper);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMatch', () => {
        it('should throw idField not found error', () => {
            matchingMock.get.mockReturnValueOnce([
                {
                    code: 'code',
                },
            ]);
            return expect(helper.getMatch(authMock, MatchingEntityEnum.CUSTOMER, 'otherCode')).rejects.toThrowWithMessage(
                MatchException,
                'No [otherCode] matching for [CUSTOMER]',
            );
        });

        it('should throw entityTypeId not found error', () => {
            matchingMock.get.mockReturnValueOnce([
                {
                    code: 'code',
                    base: true,
                    match: {
                        code: 'matchedCode',
                    },
                },
            ]);
            return expect(helper.getMatch(authMock, MatchingEntityEnum.CUSTOMER, 'code', true)).rejects.toThrowWithMessage(
                MatchException,
                'No entityTypeId for [CUSTOMER]',
            );
        });

        it('should not throw error for missing entityTypeId', () => {
            matchingMock.get.mockReturnValueOnce([
                {
                    code: 'code',
                    base: true,
                    match: {
                        code: 'matchedCode',
                    },
                },
            ]);
            return expect(helper.getMatch(authMock, MatchingEntityEnum.CUSTOMER, 'code', false)).toResolve();
        });

        it('should return fields and fieldId', () => {
            matchingMock.get.mockReturnValueOnce([
                {
                    code: 'code',
                    base: true,
                    match: {
                        code: 'matchedCode',
                    },
                },
            ]);
            return expect(helper.getMatch(authMock, MatchingEntityEnum.CUSTOMER, 'code')).resolves.toEqual({
                fields: [
                    {
                        code: 'code',
                        base: true,
                        match: {
                            code: 'matchedCode',
                        },
                    },
                ],
                idField: 'matchedCode',
                entityTypeId: undefined,
            });
        });

        it('should return fields, fieldId and entityTypeId', () => {
            matchingMock.get.mockReturnValueOnce([
                {
                    code: 'code',
                    base: true,
                    match: {
                        code: 'matchedCode',
                        childId: 42,
                    },
                },
            ]);
            return expect(helper.getMatch(authMock, MatchingEntityEnum.CUSTOMER, 'code')).resolves.toEqual({
                fields: [
                    {
                        code: 'code',
                        base: true,
                        match: {
                            code: 'matchedCode',
                            childId: 42,
                        },
                    },
                ],
                idField: 'matchedCode',
                entityTypeId: 42,
            });
        });
    });

    describe('checkParent', () => {
        it('should throw error if not linked', () => {
            matchingMock.checkParent.mockReturnValueOnce(false);
            return expect(
                helper.checkParent(
                    authMock,
                    [{ code: 'parent', base: true, match: { code: 'parentMatch' } } as FieldDto],
                    [{ code: 'child', base: true, match: { code: 'childMatch' } } as FieldDto],
                ),
            ).rejects.toThrowWithMessage(MatchException, 'Incorrect matching: [parent] is not parent of [child]');
        });

        it('should pass', () => {
            matchingMock.checkParent.mockReturnValueOnce(true);
            return expect(helper.checkParent(authMock, [], [])).toResolve();
        });
    });

    describe('saveError', () => {
        it('should pass', async () => {
            const saveMock = jest.spyOn(matchingMock, 'saveData');
            await expect(helper.saveError(authMock, MatchingEntityEnum.CUSTOMER, 42, 'some message', 'some code')).toResolve();
            expect(saveMock).toHaveBeenCalledWith(
                authMock,
                {
                    CUSTOMER: {
                        42: {
                            LastAPIResponseCode: 'some code',
                            LastAPIResponseMessage: 'some message',
                        },
                    },
                },
                null,
                ['LastAPIResponseCode', 'LastAPIResponseMessage'],
            );
        });
    });

    describe('saveNotFoundError', () => {
        it('should return true', async () => {
            const saveMock = jest.spyOn(helper, 'saveError');
            await expect(helper.saveNotFoundError(authMock, [], null, MatchingEntityEnum.CUSTOMER)).resolves.toEqual(true);
            expect(saveMock).not.toHaveBeenCalled();
        });

        it('should return false', async () => {
            const saveMock = jest.spyOn(helper, 'saveError');
            await expect(helper.saveNotFoundError(authMock, [{}], null, MatchingEntityEnum.CUSTOMER)).resolves.toEqual(false);
            expect(saveMock).not.toHaveBeenCalled();

            await expect(helper.saveNotFoundError(authMock, [{}], {}, MatchingEntityEnum.CUSTOMER)).resolves.toEqual(false);
            expect(saveMock).not.toHaveBeenCalled();
        });

        it('should save error', async () => {
            const saveMock = jest.spyOn(helper, 'saveError');
            await expect(helper.saveNotFoundError(authMock, [], { CUSTOMER: 42 } as IApiResponseFields, MatchingEntityEnum.CUSTOMER)).resolves.toEqual(true);
            expect(saveMock).toHaveBeenCalledWith(authMock, MatchingEntityEnum.CUSTOMER, 42, 'Item not found in API', 404);
        });
    });

    describe('getEuropaceToken', () => {

        beforeEach(() => {
            matchingMock.get.mockResolvedValueOnce([
                {
                    code: 'service',
                    base: false,
                    type: 'string',
                    match: {
                        code: 'service',
                        defaultValue: 'europace',
                    },
                },
            ]);
        });

        it('should throw bad request error if user id empty', async () => {
            await expect(helper.getEuropaceToken(authMock, 0))
               .rejects.toThrowWithMessage(BadRequestException, 'Lead assignedById is empty');
            await expect(helper.getEuropaceToken(authMock, -1))
               .rejects.toThrowWithMessage(BadRequestException, 'Lead assignedById is empty');
            await expect(helper.getEuropaceToken(authMock, undefined))
               .rejects.toThrowWithMessage(BadRequestException, 'Lead assignedById is empty');
            await expect(helper.getEuropaceToken(authMock, null))
               .rejects.toThrowWithMessage(BadRequestException, 'Lead assignedById is empty');
        });

        it('should throw bad request error for match service id', async () => {
            matchingMock.get.mockReset();
            matchingMock.get.mockResolvedValueOnce([
                {
                    code: 'service',
                    base: false,
                    type: 'string',
                    match: {
                        code: 'service',
                        defaultValue: '',
                    },
                },
            ]);

            await expect(helper.getEuropaceToken(authMock, 42))
               .rejects.toThrowWithMessage(BadRequestException, 'Credentials serviceId is empty');
        });

        it('should throw bad request error for credentials list empty', () => {
            bxApiMock.getList.mockReturnValueOnce({ data: [] });
            return expect(helper.getEuropaceToken(authMock, 42))
               .rejects.toThrowWithMessage(BadRequestException, 'Credentials not found');
        });

        it('should throw not found error for credentials not found', async () => {
            matchingMock.prepareData.mockResolvedValueOnce(null);
            return expect(helper.getEuropaceToken(authMock, 42))
               .rejects.toThrowWithMessage(NotFoundException, 'credentials.notFound');
        });

        it('should return token data and partner id', async () => {
            await expect(helper.getEuropaceToken(authMock, 42))
               .resolves.toEqual([
                   { access_token: 'access token', other: 'some data'},
                  'c_partnerId'
               ]);
            expect(europaceMock.getToken).toHaveBeenCalledWith(authMock, 'c_url', 'c_username', 'c_password', undefined)
        });

        it('should use subject', async () => {
            await expect(helper.getEuropaceToken(authMock, 42, true))
               .resolves.toEqual([
                   { access_token: 'access token', other: 'some data'},
                   'c_partnerId'
               ]);
            expect(europaceMock.getToken).toHaveBeenCalledWith(authMock, 'c_url', 'c_username', 'c_password', 'c_partnerId')
        })
    });
});
