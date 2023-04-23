import { BadRequestException, ExecutionContext } from '@nestjs/common';
import 'jest-extended';
import RobotGuard from '../../../../src/modules/robot/guards/robot.guard';
import { AuthService } from '../../../../src/common/modules/auth/auth.service';
import { ErrorHandler } from '../../../../src/common/modules/errorhandler/error.handler.service';
import { Auth } from '../../../../src/common/modules/auth/model/entities/auth.entity';

jest.mock('@nestjs/common/services');
const authMock: AuthService = {
   getByMemberId: jest.fn().mockReturnThis()
} as unknown as AuthService;
const getRequestMock = jest.fn().mockReturnValue({
   body: {
      code: 'test',
      document_id: 'document_id',
      document_type: 'document_type',
      auth: {
         member_id: 'member_id'
      }
   }
})
const contextMock = {
   switchToHttp: () => ({
      getRequest: getRequestMock
   })
} as unknown as ExecutionContext

describe('RobotGuard', () => {
   let guard: RobotGuard;

   beforeEach(() => {
      guard = new RobotGuard(authMock, new ErrorHandler())
   })

   it('should throw bad request error if incorrect robot data', async () => {
      getRequestMock.mockReturnValueOnce({ body: null });
      await expect(guard.canActivate(contextMock)).rejects
         .toThrowWithMessage(BadRequestException, 'Seems not to be a robot call');

      getRequestMock.mockReturnValueOnce({ body: {} });
      await expect(guard.canActivate(contextMock)).rejects
         .toThrowWithMessage(BadRequestException, 'Seems not to be a robot call');

      getRequestMock.mockReturnValueOnce({ body: { code: 'code' } });
      await expect(guard.canActivate(contextMock)).rejects
         .toThrowWithMessage(BadRequestException, 'Seems not to be a robot call');

      getRequestMock.mockReturnValueOnce({ body: { code: 'code', document_id: 'document_id' } });
      await expect(guard.canActivate(contextMock)).rejects
         .toThrowWithMessage(BadRequestException, 'Seems not to be a robot call');

      getRequestMock.mockReturnValueOnce({ body: { code: 'code', document_id: 'document_id', document_type: 'document_type' } });
      await expect(guard.canActivate(contextMock)).rejects
         .toThrowWithMessage(BadRequestException, 'Seems not to be a robot call');

      getRequestMock.mockReturnValueOnce({ body: { code: 'code', document_id: 'document_id', document_type: 'document_type', auth: {} } });
      await expect(guard.canActivate(contextMock)).rejects
         .toThrowWithMessage(BadRequestException, 'Seems not to be a robot call');

   })

   it('should throw bad request error if unexpected robot', () => {
      getRequestMock.mockReturnValueOnce({
         body: {
            code: 'code',
            document_id: 'document_id',
            document_type: 'document_type',
            auth: {member_id: 'member_id'}
         }
      });
      return expect(guard.canActivate(contextMock)).rejects
         .toThrowWithMessage(BadRequestException, 'Unexpected robot: [code]');
   })

   it('should return false if auth not found', () => {
      jest.spyOn(authMock, 'getByMemberId').mockReturnValueOnce(null)
      return expect(guard.canActivate(contextMock)).resolves.toBeFalse()
   })

   it('should return false if auth not active', () => {
      jest.spyOn(authMock, 'getByMemberId').mockReturnValueOnce(Promise.resolve({ active: false } as Auth))
      return expect(guard.canActivate(contextMock)).resolves.toBeFalse()
   })

   it('should return true', () => {
      jest.spyOn(authMock, 'getByMemberId').mockReturnValueOnce(Promise.resolve({ active: true } as Auth))
      return expect(guard.canActivate(contextMock)).resolves.toBeTrue()
   })
})