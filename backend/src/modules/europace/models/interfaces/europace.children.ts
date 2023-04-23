/**
 * Interface representing Europace children data.
 * @see IApiResponseFields
 */
export interface IEuropaceChildren {
    name: string;
    geburtsdatum: string;
    kindergeldWirdBezogen: boolean;
    unterhalt: number;
    kundenreferenzIdRiesterzuordnung: string;
}
