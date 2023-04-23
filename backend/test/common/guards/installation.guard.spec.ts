import InstallationGuard from '../../../src/common/guards/installation.guard';
import { AuthService } from '../../../src/common/modules/auth/auth.service';
import { ExecutionContext } from '@nestjs/common';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';

jest.mock('@nestjs/common/services/logger.service');
const authMock: AuthService = {
    getByMemberId: jest.fn().mockReturnThis(),
} as unknown as AuthService;
const contextMock = {
    switchToHttp: () => ({
        getRequest: () => ({
            headers: {
                'bitrix24-memberid': 'any',
            },
        }),
    }),
} as ExecutionContext;

describe('InstallationGuard', () => {
    let guard: InstallationGuard;

    beforeEach(() => {
        guard = new InstallationGuard(authMock);
    });

    it('should return false if auth not found', () => {
        jest.spyOn(authMock, 'getByMemberId').mockReturnValue(null);
        return expect(guard.canActivate(contextMock)).resolves.toBeFalse();
    });

    it('should return false if auth not active', () => {
        jest.spyOn(authMock, 'getByMemberId').mockReturnValue(Promise.resolve({ active: false } as Auth));
        return expect(guard.canActivate(contextMock)).resolves.toBeFalse();
    });

    it('should return true', () => {
        jest.spyOn(authMock, 'getByMemberId').mockReturnValue(Promise.resolve({ active: true } as Auth));
        return expect(guard.canActivate(contextMock)).resolves.toBeTrue();
    });
});
