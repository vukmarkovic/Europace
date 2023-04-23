import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API credentials fields data
 * @see ApiField
 * @see MatchingSeederService.credentialsFields
 */
const CREDENTIALS_FIELDS: Partial<ApiField>[] = [
    {
        id: 201,
        code: MatchingEntityEnum.CREDENTIALS,
        entity: MatchingEntityEnum.CREDENTIALS,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 202, code: 'service', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 203, code: 'url', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 2 },
    { id: 204, code: 'username', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 3 },
    { id: 205, code: 'password', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 4 },
    { id: 206, code: 'access_token', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 5 },
    { id: 207, code: 'token_type', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 6 },
    { id: 208, code: 'partnerId', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 7 },
    { id: 209, code: 'assignedById', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 8 },
    { id: 298, code: 'LastAPIResponseCode', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 98 },
    { id: 299, code: 'LastAPIResponseMessage', entity: MatchingEntityEnum.CREDENTIALS, type: BX_FIELD_TYPE.STRING, sort: 99 },
];
export default CREDENTIALS_FIELDS;
