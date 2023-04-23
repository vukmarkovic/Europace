import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API job fields data
 * @see ApiField
 * @see MatchingSeederService.jobFields
 */
const JOB_FIELDS: Partial<ApiField>[] = [
    {
        id: 401,
        code: MatchingEntityEnum.JOB,
        entity: MatchingEntityEnum.JOB,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 402, code: 'einkommenNetto', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.MONEY, sort: 1 },
    { id: 403, code: 'riesterangaben.bruttojahreseinkommenErwartet', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.MONEY, sort: 2 },
    { id: 404, code: 'riesterangaben.bruttovorjahreseinkommen', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.MONEY, sort: 3 },
    { id: 405, code: 'beschaeftigung.@type', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 4 },
    { id: 406, code: 'beschaeftigung.beruf', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 5 },
    { id: 407, code: 'beschaeftigung.beschaeftigungsstatus', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.DATE, sort: 6 },
    { id: 408, code: 'beschaeftigung.situationNachRenteneintritt.rentenbeginn', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.DATE, sort: 7 },
    {
        id: 409,
        code: 'beschaeftigung.situationNachRenteneintritt.gesetzlicheRenteMonatlich',
        entity: MatchingEntityEnum.JOB,
        type: BX_FIELD_TYPE.MONEY,
        sort: 8
    },
    { id: 410, code: 'beschaeftigung.situationNachRenteneintritt.privateRenteMonatlich', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.MONEY, sort: 9 },
    {
        id: 411,
        code: 'beschaeftigung.situationNachRenteneintritt.sonstigesEinkommenMonatlich',
        entity: MatchingEntityEnum.JOB,
        type: BX_FIELD_TYPE.MONEY,
        sort: 10
    },
    { id: 412, code: 'beschaeftigung.taetigkeit(SelbststaendigeTaetigkeit).taetigSeit', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.DATE, sort: 11 },
    {
        id: 413,
        code: 'beschaeftigung.taetigkeit(SelbststaendigeTaetigkeit).berufsbezeichnung',
        entity: MatchingEntityEnum.JOB,
        type: BX_FIELD_TYPE.STRING,
        sort: 12
    },
    { id: 414, code: 'beschaeftigung.taetigkeit(SelbststaendigeTaetigkeit)).firma', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 13 },
    { id: 415, code: 'beschaeftigung.beschaeftigungsverhaeltnis.arbeitgeber.name', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 14 },
    {
        id: 416,
        code: 'beschaeftigung.beschaeftigungsverhaeltnis.arbeitgeber.inDeutschland',
        entity: MatchingEntityEnum.JOB,
        type: BX_FIELD_TYPE.BOOL,
        sort: 15
    },
    { id: 417, code: 'beschaeftigung.beschaeftigungsverhaeltnis.probezeit', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.BOOL, sort: 16 },
    { id: 418, code: 'beschaeftigung.beschaeftigungsverhaeltnis.anzahlGehaelterProJahr', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 17 },
    { id: 419, code: 'beschaeftigung.beschaeftigungsverhaeltnis.beschaeftigtSeit', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.DATE, sort: 18 },
    
    { id: 420, code: 'zusatzangaben.branche', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 19 },
    { id: 421, code: 'zusatzangabenDsl.@type', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 20 },
    { id: 422, code: 'zusatzangabenDsl.bruttoVorjahresEinkommen', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.MONEY, sort: 21 },
    { id: 423, code: 'zusatzangabenDsl.beschaeftigungImOeffentlichenDienst', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.BOOL, sort: 22 },
    { id: 424, code: 'zusatzangabenMhb.@type', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 23 },
    { id: 425, code: 'zusatzangabenMhb.branche', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 24 },
    { id: 426, code: 'zusatzangabenIng.@type', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 25 },
    { id: 427, code: 'zusatzangabenIng.berufsgruppe', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 26 },
    { id: 428, code: 'zusatzangabenIng.branche', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 27 },
    { id: 429, code: 'zusatzangabenIng.privateKrankenversicherungMonatlicheAusgaben', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.MONEY, sort: 28 },
    { id: 1020, code: 'steuerId', entity: MatchingEntityEnum.JOB, type: BX_FIELD_TYPE.STRING, sort: 29 },
    
];
export default JOB_FIELDS;
