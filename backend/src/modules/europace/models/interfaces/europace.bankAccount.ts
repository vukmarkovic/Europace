/**
 * Interface representing Europace bank account data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceBankAccount {
    nameKontoinhaberKeinKunde: string;
    iban: string;
    bic: string;
    kundenreferenzIdsDerKontoinhaber?: string[];
}
