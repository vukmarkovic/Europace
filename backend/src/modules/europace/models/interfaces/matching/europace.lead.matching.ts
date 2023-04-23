import { IApiResponseFields } from '../../../../../modules/matching/models/interfaces/api.response.fields';
import { IEuropaceBankAccount } from '../europace.bankAccount';
import { IEuropaceChildren } from '../europace.children';
import { IEuropaceCustomer } from '../europace.customer';
import { IHasLinkedEntities } from '../../../../matching/models/interfaces/has.linked.entities';

/**
 * Interface representing Europace lead data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceLeadMatching extends IApiResponseFields, IHasLinkedEntities {
    LEAD: number;
    id: string;
    assignedById: number;
    importMetadaten?: {
        //datenkontext: 'ECHT_GESCHAEFT';
        externeVorgangsId?: string;
        importquelle?: string;
        // leadtracking: {
        //     kampagne: 'Trisalis AG';
        //     keyword: 'Altersvorsorge - stark wie Beton';
        //     trackingId: 'be8d40b0-25af-48ae-8c57-a1b72527f903';
        // };
        // zusaetzlicherEreignistext: 'Premium-Kunde';
        // prioritaet: 'HOCH';
        betreuung?: {
            kundenbetreuer?: string;
            bearbeiter?: string;
        };
        tippgeber?: {
            tippgeberPartnerId: string;
            // tippgeberprovisionswunsch: {
            //     '@type': 'BETRAG';
            //     betrag: 50;
            // };
        };
    };
    updateMetadaten?: {
        betreuung?: {
            kundenbetreuer?: string;
            bearbeiter?: string;
        };
        tippgeber: {
            tippgeberPartnerId: string;
            // tippgeberprovisionswunsch: {
            //     '@type': 'BETRAG';
            //     betrag: 50;
            // };
        };
    };
    kundenangaben: {
        haushalte: {
            kunden: IEuropaceCustomer[];
            kinder: IEuropaceChildren[];
            finanzielleSituation: {
                bestehendeImmobilien: {
                    immobilie: {
                        typ: {
                            '@type': string;
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
                }[];
                vermoegen: {
                    summeBankUndSparguthaben: {
                        guthaben: number;
                        zinsertragJaehrlich: number;
                        verwendung: {
                            '@type': string;
                            maximalEinzusetzenderBetrag: number;
                            kommentar: string;
                        };
                    };
                    summeSparplaene: {
                        aktuellerWert: number;
                        betragMonatlich: number;
                        verwendung: {
                            '@type': string;
                            kommentar: string;
                        };
                    };
                    summeDepotvermoegen: {
                        depotwert: number;
                        verwendung: {
                            '@type': string;
                            maximalEinzusetzenderBetrag: number;
                            kommentar: string;
                        };
                    };
                };
            };
            zusatzangaben: {
                kfzAnzahl: number;
                zusatzangabenProProduktanbieter: any[];
            };
        }[];
        finanzierungsobjekt: {
            immobilie: any;
            darlehensliste: {
                '@type': string;
            }[];
        };
        finanzierungsbedarf: {
            finanzierungszweck: any;
            finanzierungsbausteine: any[];
        };
        bankverbindung: IEuropaceBankAccount;
    };

    ZusatzangabenHaushaltDsltype: string;
    ZusatzangabenHaushaltDsllebenshaltungskostenMonatlich: string;

    ZusatzangabenHaushaltIngtype: string;
    ZusatzangabenHaushaltInganzahlErwachseneImHaushalt: string;
    ZusatzangabenHaushaltInganzahlKinderNichtImHaushalt: string;

    contactIds?: number[];
    hasUnmatched?: boolean;
}
