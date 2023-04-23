/**
 * Interface representing Europace passport data.
 */
export interface IEuropacePassport {
    ausstellendeBehoerde: string;
    ausstellungsdatum: string;
    ausweisart: {
        '@type': string;
    };
    ausweisnummer: string;
}
