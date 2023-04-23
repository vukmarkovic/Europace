import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import ErrorHandlerModule from '../../../../src/common/modules/errorhandler/error.handler.module';
import { ErrorHandler } from '../../../../src/common/modules/errorhandler/error.handler.service';

describe('ErrorHandlerModule', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [ErrorHandlerModule],
        }).compile();

        app = module.createNestApplication();
        app.useLogger(false);
        await app.init();
    });

    it('ErrorHandler should be defined', () => {
        expect(app.get(ErrorHandler)).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
