import { IApiResponseFields } from '../../../../../modules/matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace object data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceObjectMatching extends IApiResponseFields {
    OBJECT?: number;

    finanzierungsobjekt: {
        immobilie: any;
    };
    finanzierungsbedarf: {
        finanzierungszweck: any;
    };

    hasUnmatched?: boolean;
}
