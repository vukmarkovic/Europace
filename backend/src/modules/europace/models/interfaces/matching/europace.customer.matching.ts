import { IApiResponseFields } from '../../../../matching/models/interfaces/api.response.fields';
import { IEuropaceJob } from '../europace.job.response';
import { IEuropacePassport } from '../europace.passport.response';

/**
 * Interface representing Europace children data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceCustomerMatching extends IApiResponseFields {
    CUSTOMER?: number;
    importquelle: string;
    externeKundenId: string;
    referenzId: string;
    personendaten: {
        geburtsort: string;
        geburtsdatum: string;
        staatsangehoerigkeit: string;
        familienstand: {
            '@type': string;
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
    };
    kontakt: {
        telefonnummer: {
            vorwahl: string;
            nummer: string;
        };
        email: string;
    };
    zusatzangaben: {
        branche?: string;
        legitimationsdaten: IEuropacePassport;
        zusatzangabenProProduktanbieter?: any[];
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

    finanzielles: IEuropaceJob;
}
