/**
 * Interface representing Bitrix24 rest API authentication data
 */
interface IBxAuthData {
    /**
     * Bitrix24 portal identifier, should be unique per portal
     */
    member_id: string;
    /**
     * Bitrix24 portal domain
     */
    domain: string;
    /**
     * Bitrix24 API authorization token
     */
    access_token: string;
    /**
     * Bitrix24 API token used to refresh `access_token`
     */
    refresh_token: string;
    /**
     * `access_token` expire timestamp
     */
    expires_in: number;
    /**
     * Application version installed on client's Bitrix24 portal
     */
    version: number;
}

export default IBxAuthData;
