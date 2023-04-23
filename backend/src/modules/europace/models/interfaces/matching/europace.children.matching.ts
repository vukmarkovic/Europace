import { IApiResponseFields } from '../../../../matching/models/interfaces/api.response.fields';

/**
 * Interface representing Europace children data from Bitrix24.
 * @see IApiResponseFields
 */
export interface IEuropaceChildrenMatching extends IApiResponseFields {
    CHILDREN?: number;
    name: string;
    geburtsdatum: string;
    kindergeldWirdBezogen: boolean;
    unterhalt: number;
    kundenreferenzIdRiesterzuordnung: string;

    assignedById?: number;
    hasUnmatched?: boolean;
}
