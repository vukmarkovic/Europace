import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API application fields data
 * @see ApiField
 * @see MatchingSeederService.application
 */
const APPLICATION_FIELDS: Partial<ApiField>[] = [
    {
        id: 1301,
        code: MatchingEntityEnum.APPLICATION,
        entity: MatchingEntityEnum.APPLICATION,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 1302, code: 'antragsNummer', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 1303, code: 'status', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.STRING, sort: 2 },
    { id: 1304, code: 'datenKontext', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.STRING, sort: 3 },
    { id: 1305, code: 'zeitpunktDerAnnahme', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.DATETIME, sort: 4 },
    { id: 1306, code: 'produktAnbieter', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.STRING, sort: 5 },
    { id: 1307, code: 'produktAnbieterIblock', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.STRING, sort: 6 },
    { id: 1308, code: 'dokumente', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.INTEGER, sort: 7 },
    { id: 1309, code: 'prolongation', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.BOOL, sort: 8 },
    { id: 1310, code: 'letzteAenderung', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.DATE, sort: 9 },
    { id: 1311, code: 'entscheidungsreifeVomVertriebSignalisiert', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.BOOL, sort: 10 },
    { id: 1312, code: '_links.self.href', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.STRING, sort: 11 },
    { id: 1313, code: 'vermittler', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.INTEGER, sort: 12 },
    { id: 1314, code: 'kreditSachbearbeiter', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.STRING, sort: 13 },
    { id: 1315, code: 'zugrundeliegendeDaten', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.INTEGER, sort: 14 },
    { id: 1316, code: 'Pipeline', entity: MatchingEntityEnum.APPLICATION, type: BX_FIELD_TYPE.CRM_CATEGORY, sort: 15 },
];
export default APPLICATION_FIELDS;