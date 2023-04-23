import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import FilesModule from '../../../../src/common/modules/files/files.module';
import FileDownloader from '../../../../src/common/modules/files/file.downloader';
import ErrorHandlerModule from '../../../../src/common/modules/errorhandler/error.handler.module';

describe('FilesModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [FilesModule, ErrorHandlerModule],
        }).compile();

        app = module.createNestApplication();
        app.useLogger(false);
        await app.init();
    });

    it('FileDownloader should be defined', () => {
        expect(app.get(FileDownloader)).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
