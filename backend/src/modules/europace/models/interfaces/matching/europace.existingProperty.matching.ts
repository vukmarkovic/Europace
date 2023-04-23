import { IApiResponseFields } from '../../../../../modules/matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace existing property object data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceExistingPropertyMatching extends IApiResponseFields {
    EXISTING_PROPERTY?: number;

    bezeichnung: string;
    marktwert: number;
    immobilie: {
        adresse: {
            strasse: string;
            hausnummer: string;
            plz: number;
            ort: string;
        };
        typ: {
            '@type': string;
            anzahlDerWohneinheitenImObjekt: number;
            gebaeude?: {
                nutzung?: {
                    wohnen?: {
                        nutzungsart?: {
                            '@type'?: string;
                        };
                    };
                };
            };
        };
    };

    hasUnmatched?: boolean;
}
