import { IApiResponseFields } from '../../../../matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace applicant data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceApplicantMatching extends IApiResponseFields {
    APPLICANT?: number;

    externeKundenId: string;
    referenzId: string;
    personendaten: {
        geburtsort: string;
        geburtsdatum: string;
        staatsangehoerigkeit: string;
        familienstand: {
            '@type': string;
            guetertrennungVereinbart?: boolean;
        };
        person: {
            anrede: string;
            vorname: string;
            nachname: string;

            titel: {
                prof: boolean;
                dr: boolean;
            };
        };
        nichtEuBuerger?: {
            aufenthaltstitel?: {
                '@type'?: string;
                befristetBis?: string;
                arbeitserlaubnis?: {
                    '@type'?: string;
                    befristetBis: string;
                };
            };
        };
    };
    wohnsituation: {
        wohnhaftSeit: string;
        anschrift: {
            strasse: string;
            hausnummer: string;
            plz: number;
            ort: string;
        };
        voranschrift: {
            strasse: string;
            hausnummer: string;
            plz: number;
            ort: string;
        };
        finanzielles: {
            steuerId: string;
            riesterangaben: {
                sozialversicherungsnummer: string;
            };
        };
    };

    hasUnmatched?: boolean;
}
