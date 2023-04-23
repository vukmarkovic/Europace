import { IApiResponseFields } from '../../../../matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace job data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceJobMatching extends IApiResponseFields {
    JOB?: number;
    steuerId: string;
    beschaeftigung: {
        '@type': string;
        beruf: string;
        situationNachRenteneintritt: {
            rentenbeginn: string;
            gesetzlicheRenteMonatlich: number;
            privateRenteMonatlich: number;
            sonstigesEinkommenMonatlich: number;
        };
        beschaeftigungsverhaeltnis: {
            arbeitgeber: {
                name: string;
                inDeutschland: boolean;
                inDeutschlandKommentar: string;
            };
            probezeit: boolean;
            anzahlGehaelterProJahr: string;
            beschaeftigtSeit: string;
        };
        beschaeftigungsstatus: string;
    };
    einkommenNetto: number;
    riesterangaben: {
        bruttojahreseinkommenErwartet: number;
        bruttovorjahreseinkommen: number;
        sozialversicherungsnummer: string;
    };

    zusatzangaben: {
        branche: string;
    };
    zusatzangabenDsl?: {
        '@type': string;
        beschaeftigungImOeffentlichenDienst: boolean;
        bruttoVorjahresEinkommen: number;
    };
    zusatzangabenMhb?: {
        '@type': string;
        branche: string;
    };
    zusatzangabenIng?: {
        '@type': string;
        berufsgruppe: string;
        branche: string;
        geburtsland: string;
        privateKrankenversicherungMonatlicheAusgaben: number;
    };

    hasUnmatched?: boolean;
}
