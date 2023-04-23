import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import 'jest-extended';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import SettingsService from '../../../src/modules/settings/settings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import AppSettings from '../../../src/modules/settings/models/entities/app.settings.entity';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const authMock = {
    id: 1,
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;
const repoMock = {
    findOne: jest.fn().mockReturnValue({ id: 42, test: 'test' }),
    save: jest.fn().mockReturnThis(),
};

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettingsService,
                ErrorHandler,
                {
                    provide: getRepositoryToken(AppSettings),
                    useValue: repoMock,
                },
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
        service = await module.get<SettingsService>(SettingsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('get', () => {
        it('should return null', () => {
            repoMock.findOne.mockReturnValueOnce(null);
            expect(service['get'](authMock)).resolves.toBeNull();
        });

        it('should return settings', () => {
            expect(service['get'](authMock)).resolves.toEqual({ id: 42, test: 'test' });
        });

        it('should throw internal error', () => {
            repoMock.findOne.mockImplementationOnce(() => {
                throw 'error';
            });
            expect(service['get'](authMock)).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to get settings');
        });
    });

    describe('save', () => {
        it('should save settings', async () => {
            await expect(service['save'](authMock, { id: 24, auth: authMock, test: '', admins: '', placements: ''})).toResolve();
            expect(repoMock.save).toHaveBeenCalledWith({ id: 24, auth: authMock, test: '', admins: '', placements: '' });
        });

        it('should throw internal error', () => {
            repoMock.save.mockImplementationOnce(() => {
                throw 'error';
            });
            expect(service['save'](authMock, null)).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to save settings');
        });
    });

    describe('saveSettings', () => {
        it('should throw bad request error', async () => {
            await expect(service.saveSettings(authMock, 'id', 42)).rejects.toThrowWithMessage(BadRequestException, 'settings.wrongKey');
            await expect(service.saveSettings(authMock, 'auth', authMock)).rejects.toThrowWithMessage(BadRequestException, 'settings.wrongKey');
            await expect(service.saveSettings(authMock, 'missing' as keyof AppSettings, 42)).rejects.toThrowWithMessage(
                BadRequestException,
                'settings.wrongKey',
            );
        });

        it('should create new settings', async () => {
            repoMock.findOne.mockReturnValueOnce(null);
            const saveMock = jest.spyOn(service as any, 'save');
            await expect(service.saveSettings(authMock, 'test', 'test')).resolves.toBeTrue();
            expect(saveMock).toHaveBeenCalledWith(authMock, {
                admins: '',
                test: 'test',
                placements: '',
                auth: authMock,
            });
        });

        it('should update existing settings', async () => {
            const saveMock = jest.spyOn(service as any, 'save');
            await expect(service.saveSettings(authMock, 'test', 'test')).resolves.toBeTrue();
            expect(saveMock).toHaveBeenCalledWith(authMock, {
                id: 42,
                test: 'test',
            });
        });
    });

    describe('getSettings', () => {
        it('should return value', () => {
            return expect(service.getSettings(authMock, 'test')).resolves.toEqual('test');
        });

        it('should return undefined', () => {
            repoMock.findOne.mockReturnValueOnce(null);
            return expect(service.getSettings(authMock, 'test')).resolves.toBeUndefined();
        });
    });
});
