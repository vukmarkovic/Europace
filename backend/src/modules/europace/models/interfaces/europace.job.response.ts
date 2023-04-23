/**
 * Interface representing Europace job data.
 * @see IApiResponseFields
 */
export interface IEuropaceJob {
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
}
