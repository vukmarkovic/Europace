import { Test, TestingModule } from '@nestjs/testing';
import { ErrorHandler } from '../../../../src/common/modules/errorhandler/error.handler.service';
import { ModuleMocker } from 'jest-mock';
import FileDownloader from '../../../../src/common/modules/files/file.downloader';
import { Auth } from '../../../../src/common/modules/auth/model/entities/auth.entity';
import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { promises as fs } from 'fs';

jest.mock('@nestjs/common/services/logger.service');
const moduleMocker = new ModuleMocker(global);
const auth = {
    domain: 'domain.test',
    member_id: 'member_id.test',
} as Auth;

jest.mock('fs/promises');
const fsMock = fs as jest.Mocked<typeof fs>;
fsMock.access = jest.fn().mockReturnThis();
fsMock.mkdir = jest.fn().mockReturnThis();
fsMock.writeFile = jest.fn().mockReturnThis();
fsMock.readFile = jest.fn().mockReturnValue('base64');
fsMock.unlink = jest.fn().mockReturnThis();

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;
axiosMock.get = jest.fn().mockReturnValue('response');

describe('FileDownloader', () => {
    let service: FileDownloader;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FileDownloader, ErrorHandler],
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
        service = await module.get<FileDownloader>(FileDownloader);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return null', async () => {
        await expect(service.downloadFile(auth, '')).resolves.toEqual(null);
        await expect(service.downloadFile(auth, null)).resolves.toEqual(null);
        await expect(service.downloadFile(auth, undefined)).resolves.toEqual(null);
    });

    it('should create directory', async () => {
        fsMock.access.mockImplementationOnce(() => {
            throw 'error';
        });
        await expect(service.downloadFile(auth, 'url')).toResolve();
        expect(fsMock.mkdir).toHaveBeenCalled();
    });

    it('should throw internal error if request failed', async () => {
        axiosMock.get.mockImplementationOnce(() => {
            throw 'error';
        });
        await expect(service.downloadFile(auth, 'url')).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to download file');

        expect(fsMock.access).toHaveBeenCalledTimes(2);
        expect(fsMock.unlink).toHaveBeenCalled();
        expect(fsMock.mkdir).not.toHaveBeenCalled();
        expect(fsMock.writeFile).not.toHaveBeenCalled();
        expect(fsMock.readFile).not.toHaveBeenCalled();
    });

    it('should throw internal error if file write failed', async () => {
        fsMock.writeFile.mockImplementationOnce(() => {
            throw 'error';
        });
        await expect(service.downloadFile(auth, 'url')).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to download file');

        expect(fsMock.access).toHaveBeenCalledTimes(2);
        expect(fsMock.unlink).toHaveBeenCalled();
        expect(fsMock.mkdir).not.toHaveBeenCalled();
        expect(fsMock.readFile).not.toHaveBeenCalled();
    });

    it('should throw internal error if file read failed', async () => {
        fsMock.readFile.mockImplementationOnce(() => {
            throw 'error';
        });
        await expect(service.downloadFile(auth, 'url')).rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to download file');

        expect(fsMock.access).toHaveBeenCalledTimes(2);
        expect(fsMock.unlink).toHaveBeenCalled();
        expect(fsMock.mkdir).not.toHaveBeenCalled();
        expect(fsMock.writeFile).toHaveBeenCalled();
    });

    it('should return encoded file', async () => {
        await expect(service.downloadFile(auth, 'url')).resolves.toEqual('base64');

        expect(fsMock.access).toHaveBeenCalledTimes(2);
        expect(fsMock.unlink).toHaveBeenCalled();
        expect(fsMock.mkdir).not.toHaveBeenCalled();
        expect(fsMock.writeFile).toHaveBeenCalled();
        expect(fsMock.readFile).toHaveBeenCalled();
    });
});
