import { IApiResponseFields } from '../../../../../modules/matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace credentials data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceCredentialsMatching extends IApiResponseFields {
    CREDENTIALS: number;
    service: string;
    url: string;
    username: string;
    password: string;
    access_token: string;
    token_type: string;
    partnerId: string;
    hasUnmatched?: boolean;
}
