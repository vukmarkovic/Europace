import { IEuropaceJob } from './europace.job.response';
import { IEuropacePassport } from './europace.passport.response';

/**
 * Interface representing Europace customer data.
 * @see IApiResponseFields
 */
export interface IEuropaceCustomer {
    externeKundenId: string;
    referenzId: string;
    importquelle: string;
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

// externeKundenId: 'extKunde1';
// referenzId: '631f1f2052d7c058629fc3eb';
// personendaten: {
//     person: {
//         titel: {
//             prof: false;
//             dr: false;
//         };
//         anrede: 'HERR';
//         vorname: 'Toni';
//         nachname: 'Tester';
//     };
//     geburtsdatum: '1973-09-15';
//     geburtsort: 'Geborensdorf';
//     staatsangehoerigkeit: 'DE';
//     familienstand: {
//         '@type': 'VERHEIRATET';
//         guetertrennungVereinbart: true;
//     };
// };
// wohnsituation: {
//     wohnhaftSeit: '2010-08-23';
//     anschrift: {
//         strasse: 'Waisenstraße';
//         hausnummer: '24';
//         plz: '10179';
//         ort: 'Berlin';
//     };
//     voranschrift: {
//         strasse: 'Mustergasse';
//         hausnummer: '23';
//         plz: '12345';
//         ort: 'Musterort';
//     };
// };
// finanzielles: {
//     steuerId: 'steuer1234567';
//     beschaeftigung: {
//         '@type': 'ANGESTELLTER';
//         beruf: 'Ingenieur';
//         situationNachRenteneintritt: {
//             rentenbeginn: '2035-05-01';
//             gesetzlicheRenteMonatlich: 2200.1;
//             privateRenteMonatlich: 2.2;
//             sonstigesEinkommenMonatlich: 1.3;
//         };
//         beschaeftigungsverhaeltnis: {
//             arbeitgeber: {
//                 name: 'ABC GmbH';
//                 inDeutschland: true;
//                 inDeutschlandKommentar: 'Kommentar c87a3d3b-7a32-414a-a04b-f6399ff58b6f';
//             };
//             probezeit: false;
//             anzahlGehaelterProJahr: 'ZWOELF';
//             beschaeftigtSeit: '2015-04-13';
//         };
//         beschaeftigungsstatus: 'UNBEFRISTET';
//     };
//     einkommenNetto: 5000.4;
//     riesterangaben: {
//         bruttojahreseinkommenErwartet: 5.5;
//         bruttovorjahreseinkommen: 6.6;
//         sozialversicherungsnummer: 'soz2134567';
//     };
// };
// kontakt: {
//     telefonnummer: {
//         vorwahl: '030';
//         nummer: '420860';
//     };
//     email: 'toni.tester@europace.de';
//     weitereKontaktmoeglichkeiten: 'weiterer Kontakt';
// };
// zusatzangaben: {
//     branche: 'BAUGEWERBE';
//     legitimationsdaten: {
//         ausweisart: {
//             '@type': 'PERSONALAUSWEIS';
//         };
//         ausstellungsdatum: '2010-04-05';
//         ausstellendeBehoerde: 'behoerde123';
//         ausweisnummer: 'ausweisnummer123';
//     };
//     zusatzangabenProProduktanbieter: [
//         {
//             '@type': 'ZUSATZANGABEN_KUNDE_DSL';
//             bruttoVorjahresEinkommen: 80000.0;
//             beschaeftigungImOeffentlichenDienst: false;
//         },
//         {
//             '@type': 'ZUSATZANGABEN_KUNDE_ING';
//             berufsgruppe: 'ANGESTELLTER';
//             branche: 'BAUGEWERBE';
//             privateKrankenversicherungMonatlicheAusgaben: 250.7;
//             geburtsland: 'DE';
//             weitereStaatsangehoerigkeitenErfassung: {
//                 '@type': 'KEINE_WEITERE_STAATSANGEHOERIGKEITEN';
//             };
//         },
//         {
//             '@type': 'ZUSATZANGABEN_KUNDE_MHB';
//             branche: 'BAU';
//         },
//     ];
// };
