import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API document fields data
 * @see ApiField
 * @see MatchingSeederService.document
 */
const DOCUMENT_FIELDS: Partial<ApiField>[] = [
    {
        id: 1401,
        code: MatchingEntityEnum.DOCUMENT,
        entity: MatchingEntityEnum.DOCUMENT,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 1402, code: 'id', entity: MatchingEntityEnum.DOCUMENT, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 1403, code: 'Type', entity: MatchingEntityEnum.DOCUMENT, type: BX_FIELD_TYPE.STRING, sort: 2 },
    { id: 1404, code: 'File', entity: MatchingEntityEnum.DOCUMENT, type: BX_FIELD_TYPE.STRING, sort: 3 },
    { id: 1405, code: 'LetzteAPIResponseCode', entity: MatchingEntityEnum.DOCUMENT, type: BX_FIELD_TYPE.STRING, sort: 4 },
    { id: 1406, code: 'LetzterAPIResponseText', entity: MatchingEntityEnum.DOCUMENT, type: BX_FIELD_TYPE.STRING, sort: 5 },
];
export default DOCUMENT_FIELDS;