import { Global, Module } from '@nestjs/common';
import { ErrorHandler } from './error.handler.service';

/**
 * Module providing error handler.
 * @see ErrorHandler
 */
@Global()
@Module({
    exports: [ErrorHandler],
    providers: [ErrorHandler],
})
export default class ErrorHandlerModule {}
