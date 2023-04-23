/**
 * Interface representing Europace existion property object data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceExistingProperty {
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
}
