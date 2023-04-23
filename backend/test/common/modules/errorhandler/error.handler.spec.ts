import { Test, TestingModule } from '@nestjs/testing';
import { ErrorHandler } from '../../../../src/common/modules/errorhandler/error.handler.service';
import { ModuleMocker } from 'jest-mock';
import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const auth = {
    domain: 'domain.test',
    member_id: 'member_id.test',
};

describe('ErrorHandler', () => {
    let handler: ErrorHandler;
    let loggerMock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ErrorHandler],
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
        handler = await module.get<ErrorHandler>(ErrorHandler);
        loggerMock = jest.spyOn(handler['logger'], 'error');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw forbidden error', () => {
        expect(() => handler.accessDenied(auth)).toThrowError(new ForbiddenException({ message: 'Auth data not found' }));
        expect(loggerMock).toHaveBeenLastCalledWith({ message: 'Auth data not found', ...auth });

        expect(() => handler.accessDenied(auth, 'message')).toThrowError(new ForbiddenException({ message: 'message' }));
        expect(loggerMock).toHaveBeenLastCalledWith({ message: 'message', ...auth });
    });

    it('should throw bad request error', () => {
        expect(() => handler.badRequest(auth, 'message')).toThrowError(new BadRequestException({ message: 'message' }));
        expect(() => handler.badRequest(auth, 'message', 'error')).toThrowError(new BadRequestException({ message: 'error' }));
        expect(() => handler.badRequest(auth, 'message', 'error', ['param1', 'param2'])).toThrowError(
            new BadRequestException({ message: 'error', params: ['param1', 'param2'] }),
        );

        expect(loggerMock).toHaveBeenCalledWith({ message: 'message', ...auth });
    });

    it('should throw not found error', () => {
        expect(() => handler.notFound(auth, 'message', 'error')).toThrowError(new NotFoundException({ message: 'error' }));
        expect(loggerMock).toHaveBeenCalledWith({ message: 'message', ...auth });
    });

    it('should throw internal error', () => {
        expect(() => handler.internal({ auth, message: 'message' })).toThrowWithMessage(InternalServerErrorException, 'message');
        expect(loggerMock).toHaveBeenLastCalledWith({ message: 'message', ...auth });

        expect(() =>
            handler.internal({
                auth,
                message: 'message',
                payload: { key: 'value' },
            }),
        ).toThrowWithMessage(InternalServerErrorException, 'message');
        expect(loggerMock).toHaveBeenLastCalledWith({ message: 'message', ...auth, payload: { key: 'value' } });

        const e = new Error('error') as any;
        e.stack = undefined;
        expect(() =>
            handler.internal({
                auth,
                message: 'message',
                payload: { key: 'value' },
                e,
            }),
        ).toThrowWithMessage(InternalServerErrorException, 'message');
        expect(loggerMock).toHaveBeenLastCalledWith({ message: 'message', ...auth, payload: { key: 'value' }, err: 'error' });

        e.stack = 'stack';
        expect(() =>
            handler.internal({
                auth,
                message: 'message',
                e,
            }),
        ).toThrowWithMessage(InternalServerErrorException, 'message');
        expect(loggerMock).toHaveBeenLastCalledWith({ message: 'message', ...auth, err: 'stack' });

        e.response = {
            data: 'data',
        };
        expect(() =>
            handler.internal({
                auth,
                message: 'message',
                e,
            }),
        ).toThrowWithMessage(InternalServerErrorException, 'message');
        expect(loggerMock).toHaveBeenLastCalledWith({ message: 'message', ...auth, err: 'data' });
    });
});
