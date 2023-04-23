import { IApiResponseFields } from '../../../../../modules/matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace monthly budget data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceMonthlyBudgetMatching extends IApiResponseFields {
    MONTHLY_BUDGET?: number;

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
            depotwert: 130345.5;
            verwendung: {
                '@type': string;
                maximalEinzusetzenderBetrag: number;
                kommentar: string;
            };
        };
        bausparvertraege: [
            {
                angesparterBetrag: number;
                bausparkasse: string;
                vertragsnummer: string;
                tarif: string;
                vertragsbeginn: string;
                jahresentgelt: number;
                sparbeitragMonatlich: number;
                bausparsumme: number;
                zuteilungsdatum: string;
                verwendung: {
                    '@type': string;
                    maximalEinzusetzenderBetrag: number;
                    kommentar: string;
                };
            },
        ];
        lebensOderRentenversicherungen: [
            {
                rueckkaufswert: number;
                praemieMonatlich: number;
                verwendung: {
                    '@type': string;
                    kommentar: string;
                };
                detailsWennZusatzsicherheit: {
                    versicherungsgesellschaft: string;
                    vertragsnummer: string;
                    tarif: string;
                    vertragsdatum: string;
                    vertragsende: string;
                    versicherungsart: string;
                    versicherungssumme: number;
                    verwaltungsgebuehrenJaehrlich: number;
                };
            },
        ];
        summeSonstigesVermoegen: {
            aktuellerWert: number;
            verwendung: {
                '@type': string;
                maximalEinzusetzenderBetrag: number;
                kommentar: string;
            };
        };
    };
    einnahmen: {
        summeEinkuenfteAusKapitalvermoegen: number;
        summeVariablerEinkuenfteMonatlich: number;
        einkuenfteAusNebentaetigkeit: [
            {
                betragMonatlich: number;
                beginnDerTaetigkeit: string;
            },
        ];
        summeEhegattenunterhalt: number;
        summeUnbefristeteZusatzrentenMonatlich: {
            betrag: number;
            kommentar: string;
        };
        summeSonstigeEinnahmenMonatlich: {
            betrag: number;
            kommentar: string;
        };
    };
    ausgaben: {
        summeMietausgaben: {
            betragMonatlich: number;
            entfaelltMitFinanzierung: true;
        };
        summePrivaterKrankenversicherungenMonatlich: number;
        unterhaltsverpflichtungenMonatlich: number[];
        summeSonstigerVersicherungsausgabenMonatlich: {
            betrag: number;
            kommentar: string;
        };
        summeSonstigerAusgabenMonatlich: {
            betrag: number;
            kommentar: string;
        };
    };
    verbindlichkeiten: {
        ratenkredite: [
            {
                rateMonatlich: number;
                glaeubiger: string;
                laufzeitende: string;
                restschuld: number;
                wirdAbgeloest: true;
                kommentar: string;
            },
        ];
        privatdarlehen: [
            {
                rateMonatlich: number;
                glaeubiger: string;
                laufzeitende: string;
                restschuld: number;
                wirdAbgeloest: true;
                kommentar: string;
            },
        ];
        sonstigeVerbindlichkeit: {
            rateMonatlich: number;
            glaeubiger: string;
            laufzeitende: string;
            restschuld: number;
            wirdAbgeloest: true;
            kommentar: string;
        };
    };

    hasUnmatched?: boolean;
}
