import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API bank account fields data
 * @see ApiField
 * @see MatchingSeederService.bankAccount
 */
const BANK_ACCOUNT_FIELDS: Partial<ApiField>[] = [
    {
        id: 1101,
        code: MatchingEntityEnum.BANK_ACCOUNT,
        entity: MatchingEntityEnum.BANK_ACCOUNT,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 1102, code: 'nameKontoinhaberKeinKunde', entity: MatchingEntityEnum.BANK_ACCOUNT, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 1103, code: 'iban', entity: MatchingEntityEnum.BANK_ACCOUNT, type: BX_FIELD_TYPE.STRING, sort: 2 },
    { id: 1104, code: 'bic', entity: MatchingEntityEnum.BANK_ACCOUNT, type: BX_FIELD_TYPE.STRING, sort: 3 },
];
export default BANK_ACCOUNT_FIELDS;
