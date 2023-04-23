import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from 'src/modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API children fields data
 * @see ApiField
 * @see MatchingSeederService.childernFields
 */
const CHILDREN_FIELDS: Partial<ApiField>[] = [
    {
        id: 601,
        code: MatchingEntityEnum.CHILDREN,
        entity: MatchingEntityEnum.CHILDREN,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 602, code: 'name', entity: MatchingEntityEnum.CHILDREN, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 603, code: 'geburtsdatum', entity: MatchingEntityEnum.CHILDREN, type: BX_FIELD_TYPE.DATE, sort: 2 },
    { id: 604, code: 'kindergeldWirdBezogen', entity: MatchingEntityEnum.CHILDREN, type: BX_FIELD_TYPE.BOOL, sort: 3 },
    { id: 605, code: 'unterhalt', entity: MatchingEntityEnum.CHILDREN, type: BX_FIELD_TYPE.MONEY, sort: 4 },
    // { id: 606, code: 'leadId', entity: MatchingEntityEnum.CHILDREN, type: BX_FIELD_TYPE.STRING, sort: 5 },
    { id: 607, code: 'kundenreferenzIdRiesterzuordnung', entity: MatchingEntityEnum.CHILDREN, type: BX_FIELD_TYPE.STRING, sort: 6 },
];
export default CHILDREN_FIELDS;
