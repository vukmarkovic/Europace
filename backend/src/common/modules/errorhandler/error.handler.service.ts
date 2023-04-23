import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import IInternalData from './models/interfaces/internal.data';
import { IAuthData } from '../auth/model/interfaces/auth.data.interface';

/**
 * Error handler service.
 * Used to log errors and wrap in http exceptions.
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 */
@Injectable()
export class ErrorHandler {
    protected readonly logger = new Logger();

    /**
     * Wraps error message in ForbiddenException (403).
     * @param domain - client portal domain.
     * @param member_id - client portal identifier.
     * @param message - error message, `Auth data not found` by default.
     * @throws ForbiddenException
     * @see IAuthData
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    accessDenied({ domain, member_id }: IAuthData, message?: string) {
        message = message ?? 'Auth data not found';
        this.logger.error({ message, domain, member_id });
        throw new ForbiddenException({ message });
    }

    /**
     * Wraps error message in BadRequestException (400).
     * @param domain - client portal domain.
     * @param member_id - client portal identifier.
     * @param message - error message.
     * @param error - localed text code for frontend (optional), if empty uses `message`.
     * @param params - additional params for frontend (optional).
     * @throws BadRequestException
     * @see IAuthData
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    badRequest({ domain, member_id }: IAuthData, message, error?, params?: string[]) {
        this.logger.error({ message, domain, member_id });
        throw new BadRequestException({ message: error ?? message, params });
    }

    /**
     * Wraps error message in NotFoundException (404).
     * @param domain - client portal domain.
     * @param member_id - client portal identifier.
     * @param message - error message.
     * @param error - localed text code for frontend.
     * @throws NotFoundException
     * @see IAuthData
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    notFound({ domain, member_id }: IAuthData, message, error) {
        this.logger.error({ message, domain, member_id });
        throw new NotFoundException({ message: error, domain, member_id });
    }

    /**
     * Wraps error message in InternalServerErrorException (500).
     * @param domain - client portal domain.
     * @param member_id - client portal identifier.
     * @param message - error message.
     * @param payload - any data to log.
     * @param e - occurred error.
     * @throws InternalServerErrorException
     * @see IInternalData
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    internal({ auth: { domain, member_id }, message, payload, e }: IInternalData) {
        this.logger.error({ message, domain, member_id, err: e?.response?.data ?? (e?.stack || e?.message), payload });
        throw new InternalServerErrorException(message);
    }
}
