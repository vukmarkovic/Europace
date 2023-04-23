import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API passport fields data
 * @see ApiField
 * @see MatchingSeederService.passportFields
 */
const PASSPORT_FIELDS: Partial<ApiField>[] = [
    {
        id: 301,
        code: MatchingEntityEnum.PASSPORT,
        entity: MatchingEntityEnum.PASSPORT,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 302, code: 'ausweisart.@type', entity: MatchingEntityEnum.PASSPORT, type: BX_FIELD_TYPE.CRM_STATUS, sort: 1 },
    { id: 303, code: 'ausstellungsdatum', entity: MatchingEntityEnum.PASSPORT, type: BX_FIELD_TYPE.DATE, sort: 2 },
    { id: 304, code: 'ausstellendeBehoerde', entity: MatchingEntityEnum.PASSPORT, type: BX_FIELD_TYPE.STRING, sort: 3 },
    { id: 305, code: 'ausweisnummer', entity: MatchingEntityEnum.PASSPORT, type: BX_FIELD_TYPE.STRING, sort: 4 },
    { id: 306, code: 'Pipeline', entity: MatchingEntityEnum.PASSPORT, type: BX_FIELD_TYPE.CRM_CATEGORY, sort: 5 },
];
export default PASSPORT_FIELDS;
