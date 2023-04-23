import { IApiResponseFields } from '../../../../../modules/matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace passport data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropacePassportMatching extends IApiResponseFields {
    PASSPORT?: number;

    ausstellendeBehoerde: string;
    ausstellungsdatum: string;
    ausweisart: {
        '@type': string;
    };
    ausweisnummer: string;

    hasUnmatched?: boolean;
}
