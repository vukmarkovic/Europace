import { IApiResponseFields } from '../../../../matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace bank account data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceBankAccountMatching extends IApiResponseFields {
    BANK_ACCOUNT?: number;
    nameKontoinhaberKeinKunde: string;
    iban: string;
    bic: string;

    assignedById?: number;
    hasUnmatched?: boolean;
}
