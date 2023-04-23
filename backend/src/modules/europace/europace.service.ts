import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';
import ENDPOINTS from './models/constants/europace.endpoint';
import { IEuropaceCase } from './models/interfaces/europace.case.response';
import { IEuropaceOtpResponse } from './models/interfaces/europace.otp.response';
import { IEuropaceTokenResponse } from './models/interfaces/europace.token.response';
import { IEuropaceLeadMatching } from './models/interfaces/matching/europace.lead.matching';

/**
 * Europace API integration service.
 * Used for getting from, sending to and processing data from Europace API.
 * Also handling API integration settings.
 *
 * Uses:
 * - matching interface;
 * - Bitrix24 API integration.
 *
 * @see MatchingService
 * @see BxApiService
 */
@Injectable()
export default class EuropaceService {
    private readonly logger = new Logger(EuropaceService.name);

    constructor(private readonly errorHandler: ErrorHandler) {}

    /**
     * Gets access data from Europace API.
     *
     * @param auth - Bitrix24 authentication data.
     * @param url - Europace API URL
     * @param username - Europace API username.
     * @param password - Europace API password.
     * @param subject - Europace API partner id.
     * @returns IEuropaceTokenResponse - Europace API access token and token type.
     * @throws [ForbiddenException, InternalServerErrorException]
     * @see Auth
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async getToken(auth: Auth, url: string, username: string, password: string, subject = ''): Promise<IEuropaceTokenResponse> {
        if (!url?.length || !username?.length || !password?.length) {
            this.errorHandler.accessDenied(auth, 'getToken - Empty data');
        }

        try {
            const data = qs.stringify({
                grant_type: 'client_credentials',
                subject: subject ?? '',
            });
            const response = await axios.post<IEuropaceTokenResponse>(ENDPOINTS.TOKEN.replace(':host', url), data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
                },
            });
            return response.data;
        } catch (e) {
            if (e.response?.status === 401) {
                this.errorHandler.accessDenied(auth, 'wrongApiCredentials');
            }
            this.errorHandler.internal({ auth, message: 'Failed to get Europace token', e });
        }
    }

    /**
     * Gets otp token from Europace API and return url to open in browser.
     *
     * @param auth - Bitrix24 authentication data.
     * @param authToken - Europace API access_token.
     * @param subject - Europace API partner id.
     * @param vorgangsnummer -
     * @throws [ForbiddenException, InternalServerErrorException]
     * @see Auth
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async silentSignIn(auth: Auth, authToken: string, subject: string, vorgangsnummer: string): Promise<string> {
        if (!authToken?.length || !subject?.length || !vorgangsnummer?.length) {
            this.errorHandler.accessDenied(auth, 'silentSignIn - Empty data');
        }

        try {
            const response = await axios.post<IEuropaceOtpResponse>(
                ENDPOINTS.SILENT_SIGN_IN.replace(':subject', subject),
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );
            return ENDPOINTS.AUTH_REDIRECT.replace(':subject', subject).replace(':id', vorgangsnummer).replace(':otp', response.data.otp);
        } catch (e) {
            if (e.response?.status === 401) {
                this.errorHandler.accessDenied(auth, 'wrongApiCredentials');
            }
            this.errorHandler.internal({ auth, message: 'Failed to Silent-Sign-In', e });
        }
    }

    /**
     * Create case in Europace API
     *
     * @param auth - Bitrix24 authentication data.
     * @param authToken - Europace API access_token.
     * @param lead
     * @throws [ForbiddenException, InternalServerErrorException]
     * @returns
     */
    async createCase(auth: Auth, authToken: string, lead: IEuropaceLeadMatching): Promise<{ vorgangsnummer: string }> {
        if (!authToken?.length) {
            this.errorHandler.accessDenied(auth, 'createCase - Empty token');
        }
        delete lead.importMetadaten.tippgeber;
        try {
            const response = await axios.post(ENDPOINTS.CASE_CREATE, lead, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            return response.data;
        } catch (e) {
            if (e.response?.status === 401) {
                this.errorHandler.accessDenied(auth, 'wrongApiCredentials');
            }
            this.errorHandler.internal({ auth, message: `Failed to create case: ${e.response?.data?.detail}`, e });
        }
    }

    /**
     * Update case Europace API
     *
     * @param auth - Bitrix24 authentication data.
     * @param authToken - Europace API access_token.
     * @param lead
     * @throws [ForbiddenException, InternalServerErrorException]
     * @returns
     */
    async updateCase(auth: Auth, authToken: string, lead: IEuropaceLeadMatching): Promise<string> {
        if (!authToken?.length) {
            this.errorHandler.accessDenied(auth, 'updateCase - Empty token');
        }

        try {
            await axios.put(ENDPOINTS.CASE_REPLACE.replace(':id', lead.id), lead, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            return 'Case updated successfully';
        } catch (e) {
            if (e.response?.status === 401) {
                this.errorHandler.accessDenied(auth, 'wrongApiCredentials');
            }
            this.errorHandler.internal({ auth, message: `Failed to update case: ${e.response?.data?.detail}`, e });
        }
    }

    /**
     * Get case from Europace API
     *
     * @param auth - Bitrix24 authentication data.
     * @param authToken - Europace API access_token.
     * @param vorgangsNummer - Europace API case Id.
     * @throws [ForbiddenException, InternalServerErrorException]
     */
    async getCase(auth: Auth, authToken: string, vorgangsNummer: string): Promise<IEuropaceCase> {
        if (!authToken?.length || !vorgangsNummer?.length) {
            this.errorHandler.accessDenied(auth, 'getCase - Empty data');
        }

        try {
            const response = await axios.get(ENDPOINTS.CASE_GET.replace(':id', vorgangsNummer), {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            return response.data;
        } catch (e) {
            if (e.response?.status === 401) {
                this.errorHandler.accessDenied(auth, 'wrongApiCredentials');
            }
            this.errorHandler.internal({ auth, message: `Failed to get case: ${e.response?.data?.detail}`, e });
        }
    }

    /**
     * Updates lead's `Editor` with new partner identifier.
     * @param auth - authentication data.
     * @param vorgangsNummer - lead number.
     * @param authToken - lead `Owner`'s access token.
     * @param partnerId - `Editor`'s partner identifier.
     * @throws ForbiddenException if access denied by owner's token.
     * @throws InternalServerErrorException if request failed.
     * @see Auth
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async updateEditor(auth: Auth, vorgangsNummer: string, authToken: string, partnerId: string) {
        if (!vorgangsNummer?.length) return;

        if (!authToken?.length) {
            this.errorHandler.accessDenied(auth, 'updateEditor - Empty token');
        }

        try {
            await axios.put(ENDPOINTS.SET_EDITOR.replace(':id', vorgangsNummer), { partnerId }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
        } catch (e) {
            if (e.response?.status === 401) {
                this.errorHandler.accessDenied(auth, 'wrongApiCredentials');
            }
            this.errorHandler.internal({ auth, message: `Failed to update editor: ${e.response?.data?.detail}`, e });
        }
    }
}
