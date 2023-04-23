import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API applicant fields data
 * @see ApiField
 * @see MatchingSeederService.applicantFields
 */
const APPLICANT_FIELDS: Partial<ApiField>[] = [
    {
        id: 1001,
        code: MatchingEntityEnum.APPLICANT,
        entity: MatchingEntityEnum.APPLICANT,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 1002, code: 'referenzId', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 1003, code: 'personendaten.person.anrede', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 2 },
    { id: 1004, code: 'personendaten.person.vorname', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 3 },
    { id: 1005, code: 'personendaten.person.nachname', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 4 },
    { id: 1006, code: 'personendaten.geburtsdatum', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.DATE, sort: 5 },
    { id: 1007, code: 'personendaten.person.titel.prof', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.BOOL, sort: 6 },
    { id: 1008, code: 'personendaten.person.titel.dr', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.BOOL, sort: 7 },
    { id: 1009, code: 'personendaten.staatsangehoerigkeit', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 8 },
    { id: 1010, code: 'personendaten.familienstand.@type', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 9 },
    { id: 1011, code: 'wohnsituation.wohnhaftSeit', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.DATE, sort: 10 },
    { id: 1012, code: 'wohnsituation.anschrift.strasse', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 11 },
    { id: 1013, code: 'wohnsituation.anschrift.hausnummer', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 12 },
    { id: 1014, code: 'wohnsituation.anschrift.plz', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.INTEGER, sort: 13 },
    { id: 1015, code: 'wohnsituation.anschrift.ort', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 14 },
    { id: 1016, code: 'wohnsituation.voranschrift.strasse', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 15 },
    { id: 1017, code: 'wohnsituation.voranschrift.hausnummer', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 16 },
    { id: 1018, code: 'wohnsituation.voranschrift.plz', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.INTEGER, sort: 17 },
    { id: 1019, code: 'wohnsituation.voranschrift.ort', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 18 },
    //{ id: 1020, code: 'finanzielles.steuerId', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 19 },
    { id: 1021, code: 'finanzielles.riesterangaben.sozialversicherungsnummer', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 20 },
    { id: 1022, code: 'externeKundenId', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 21 },
    { id: 1023, code: 'personendaten.nichtEuBuerger.aufenthaltstitel.@type', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 22 },
    { id: 1024, code: 'personendaten.nichtEuBuerger.aufenthaltstitel.befristetBis', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.DATE, sort: 23 },
    { id: 1025, code: 'personendaten.nichtEuBuerger.aufenthaltstitel.arbeitserlaubnis.@type', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 24 },
    { id: 1026, code: 'personendaten.nichtEuBuerger.aufenthaltstitel.arbeitserlaubnis.befristetBis', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.DATE, sort: 25 },
    { id: 1027, code: 'kontakt.email', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 26 },
    { id: 1028, code: 'personendaten.geburtsort', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.STRING, sort: 27 },
    { id: 1029, code: 'personendaten.familienstand.guetertrennungVereinbart', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.BOOL, sort: 28 },
    { id: 1030, code: 'finanzielles.beschaeftigung.inDeutschlandSeit', entity: MatchingEntityEnum.APPLICANT, type: BX_FIELD_TYPE.DATE, sort: 29 },
];
export default APPLICANT_FIELDS;
