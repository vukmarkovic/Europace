import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API customer fields data
 * @see ApiField
 * @see MatchingSeederService.customerFields
 */
const CUSTOMER_FIELDS: Partial<ApiField>[] = [
    {
        id: 801,
        code: MatchingEntityEnum.CUSTOMER,
        entity: MatchingEntityEnum.CUSTOMER,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.CONTACT,
        sort: 0,
    },
    { id: 802, code: 'importquelle', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 1 },
    // {
    //     id: 803,
    //     code: 'personendaten.person.anrede',
    //     entity: MatchingEntityEnum.CUSTOMER,
    //     type: BX_FIELD_TYPE.CRM_STATUS,
    //     sort: 2,
    // },
    {
        id: 804,
        code: 'personendaten.geburtsort',
        entity: MatchingEntityEnum.CUSTOMER,
        type: BX_FIELD_TYPE.STRING,
        sort: 3,
    },
    {
        id: 805,
        code: 'kontakt.telefonnummer.vorwahl',
        entity: MatchingEntityEnum.CUSTOMER,
        type: BX_FIELD_TYPE.STRING,
        sort: 4,
    },
    {
        id: 806,
        code: 'kontakt.telefonnummer.nummer',
        entity: MatchingEntityEnum.CUSTOMER,
        type: BX_FIELD_TYPE.STRING,
        sort: 5,
    },
    {
        id: 807,
        code: 'kontakt.email',
        entity: MatchingEntityEnum.CUSTOMER,
        type: BX_FIELD_TYPE.STRING,
        sort: 6,
    },
    {
        id: 808,
        code: 'referenzId',
        entity: MatchingEntityEnum.CUSTOMER,
        type: BX_FIELD_TYPE.STRING,
        sort: 7,
    },
    {
        id: 809,
        code: 'externeKundenId',
        entity: MatchingEntityEnum.CUSTOMER,
        type: BX_FIELD_TYPE.STRING,
        sort: 8,
    },
    // {
    //     id: 809,
    // },
    // {
    //     id: 810,
    // },

    // { id: 811 },
    // { id: 812 },
    // { id: 813 },
    // { id: 814 },
    // { id: 815, code: 'zusatzangaben.branche', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 14 },

    // { id: 816, code: 'zusatzangabenDsl.@type', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 15 },
    // { id: 817, code: 'zusatzangabenDsl.bruttoVorjahresEinkommen', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.MONEY, sort: 16 },
    // { id: 818, code: 'zusatzangabenDsl.beschaeftigungImOeffentlichenDienst', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.BOOL, sort: 17 },

    // { id: 819, code: 'zusatzangabenMhb.@type', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 18 },
    // { id: 820, code: 'zusatzangabenMhb.branche', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 19 },

    // { id: 821, code: 'zusatzangabenIng.@type', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 20 },
    // { id: 822, code: 'zusatzangabenIng.berufsgruppe', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 21 },
    // { id: 823, code: 'zusatzangabenIng.branche', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 22 },
    // {
    //     id: 824,
    //     code: 'zusatzangabenIng.privateKrankenversicherungMonatlicheAusgaben',
    //     entity: MatchingEntityEnum.CUSTOMER,
    //     type: BX_FIELD_TYPE.MONEY,
    //     sort: 23,
    // },

    // { id: 825 },
    // { id: 826 },
    // { id: 827 },
    // { id: 828 },
    // { id: 829 },
    // { id: 830 },
    // {
    //     id: 831,
    // },
    // {
    //     id: 832,
    // },
    // {
    //     id: 833,
    // },
    // {
    //     id: 834,
    // },

    // {
    //     id: 835,
    // },
    // {
    //     id: 836,
    // },
    // {
    //     id: 837,
    // },
    // {
    //     id: 838,
    // },
    // {
    //     id: 839,
    // },

    // { id: 840 },
    // { id: 1003, code: 'personendaten.person.anrede', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 40 },
    // { id: 842, code: 'personendaten.person.vorname', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 41 },
    // { id: 843, code: 'personendaten.person.nachname', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 42 },
    // { id: 844, code: 'personendaten.geburtsdatum', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.DATE, sort: 43 },
    // { id: 845, code: 'personendaten.person.titel.prof', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.BOOL, sort: 44 },
    // { id: 846, code: 'personendaten.person.titel.dr', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.BOOL, sort: 45 },
    // { id: 847, code: 'personendaten.staatsangehoerigkeit', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 46 },
    // { id: 848, code: 'personendaten.familienstand.@type', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 47 },
    // { id: 849, code: 'wohnsituation.wohnhaftSeit', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.DATE, sort: 48 },
    // { id: 850, code: 'wohnsituation.anschrift.strasse', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 49 },
    // { id: 851, code: 'wohnsituation.anschrift.hausnummer', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 50 },
    // { id: 852, code: 'wohnsituation.anschrift.plz', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.INTEGER, sort: 51 },
    // { id: 853, code: 'wohnsituation.anschrift.ort', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 52 },
    // { id: 854, code: 'wohnsituation.voranschrift.strasse', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 53 },
    // { id: 855, code: 'wohnsituation.voranschrift.hausnummer', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 54 },
    // { id: 856, code: 'wohnsituation.voranschrift.plz', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.INTEGER, sort: 55 },
    // { id: 857, code: 'wohnsituation.voranschrift.ort', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 56 },

    { id: 898, code: 'LastAPIResponseCode', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 98 },
    { id: 899, code: 'LastAPIResponseMessage', entity: MatchingEntityEnum.CUSTOMER, type: BX_FIELD_TYPE.STRING, sort: 99 },
];
export default CUSTOMER_FIELDS;
