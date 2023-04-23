import { IEuropaceErrorResponse } from './europace.error.response';

/**
 * Interface representing response data from Europace API endpoint:
 * -/oauth/token - to get access token
 */
export interface IEuropaceTokenResponse extends IEuropaceErrorResponse {
    access_token: string;
    scope: string;
    token_type: string;
    expires_in: number;
}
