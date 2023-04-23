import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API lead fields data
 * @see ApiField
 * @see MatchingSeederService.leadFields
 */
const LEAD_FIELDS: Partial<ApiField>[] = [
    {
        id: 901,
        code: MatchingEntityEnum.LEAD,
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 902, code: 'importMetadaten.externeVorgangsId', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 903, code: 'status', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 2 },
    { id: 904, code: 'id', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 3 },
    { id: 905, code: 'importMetadaten.tippgeber.tippgeberPartnerId', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 4 },
    { id: 906, code: 'd?arlehensliste(array).@type', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 5 },
    {
        id: 907,
        code: 'kundenangaben.haushalte[].finanzielleSituation.vermoegen.summeBankUndSparguthaben.guthaben',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 6,
    },
    {
        id: 908,
        code: 'kundenangaben.haushalte[].finanzielleSituation.vermoegen.summeSparplaene.aktuellerWert',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 7,
    },
    {
        id: 909,
        code: 'kundenangaben.haushalte[].finanzielleSituation.vermoegen.summeDepotvermoegen.depotwert',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 8,
    },
    {
        id: 910,
        code: 'kundenangaben.haushalte[].finanzielleSituation.vermoegen.summeSonstigesVermoegen.aktuellerWert',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 9,
    },
    { id: 911, code: 'kundenangaben.haushalte[].zusatzangaben.kfzAnzahl', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.INTEGER, sort: 10 },
    {
        id: 912,
        code: 'ZusatzangabenHaushaltDsltype',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 11,
    },
    {
        id: 913,
        code: 'ZusatzangabenHaushaltDsllebenshaltungskostenMonatlich',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 12,
    },
    {
        id: 914,
        code: 'ZusatzangabenHaushaltIngtype',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 13,
    },
    {
        id: 915,
        code: 'ZusatzangabenHaushaltInganzahlErwachseneImHaushalt',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.INTEGER,
        sort: 14,
    },
    {
        id: 916,
        code: 'ZusatzangabenHaushaltInganzahlKinderNichtImHaushalt',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.INTEGER,
        sort: 15,
    },
    {
        id: 917,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.darlehensgeber.@type',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 16,
    },
    {
        id: 918,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.darlehensgeber.produktanbieter',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 17,
    },
    { id: 919, code: 'd?arlehen.darlehensgeber(SonstigerDarlehensgeber).name', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 18 },
    {
        id: 920,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.grundschuld',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.MONEY,
        sort: 19,
    },
    {
        id: 921,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.darlehensbetrag',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.MONEY,
        sort: 20,
    },
    {
        id: 922,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.rateMonatlich',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.MONEY,
        sort: 21,
    },
    {
        id: 923,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.sollzins',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.MONEY,
        sort: 22,
    },
    {
        id: 924,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.zinsbindungBis',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DATE,
        sort: 23,
    },
    {
        id: 925,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.laufzeitende',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DATE,
        sort: 24,
    },
    {
        id: 926,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.restschuld.aktuell',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 25,
    },
    {
        id: 927,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.restschuld.zumAbloesetermin',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 26,
    },
    {
        id: 928,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.darlehenskontonummer',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 27,
    },
    {
        id: 929,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.@type',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 28,
    },
    {
        id: 930,
        code: 'kundenangaben.finanzierungsobjekt.darlehensliste[].darlehen.grundschuldart',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 29,
    },
    { id: 931, code: 'kundenangaben.finanzierungsbedarf.finanzierungszweck.@type', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 30 },
    {
        id: 932,
        code: 'kundenangaben.finanzierungsbedarf.finanzierungsbausteine[].@type',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.STRING,
        sort: 31,
    },
    {
        id: 933,
        code: 'kundenangaben.finanzierungsbedarf.finanzierungsbausteine[].darlehensbetrag',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.MONEY,
        sort: 32,
    },
    {
        id: 934,
        code: 'kundenangaben.finanzierungsbedarf.finanzierungsbausteine[].provision',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.MONEY,
        sort: 33,
    },
    {
        id: 935,
        code: 'kundenangaben.finanzierungsbedarf.finanzierungsbausteine[].laufzeitInMonaten',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.MONEY,
        sort: 34,
    },
    {
        id: 936,
        code: 'kundenangaben.finanzierungsbedarf.finanzierungsbausteine[].annuitaetendetails.zinsbindungInJahren',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.INTEGER,
        sort: 35,
    },
    {
        id: 937,
        code: 'kundenangaben.finanzierungsbedarf.finanzierungsbausteine[].annuitaetendetails.sondertilgungJaehrlich',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 36,
    },
    {
        id: 938,
        code: 'kundenangaben.finanzierungsbedarf.finanzierungsbausteine[].annuitaetendetails.auszahlungszeitpunkt',
        entity: MatchingEntityEnum.LEAD,
        type: BX_FIELD_TYPE.DATE,
        sort: 37,
    },
    { id: 939, code: 'importMetadaten.betreuung.kundenbetreuer', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 38 },
    { id: 940, code: 'importMetadaten.betreuung.bearbeiter', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 39 },
    { id: 941, code: 'contactId', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.CRM_CONTACT, sort: 40 },
    { id: 998, code: 'LastAPIResponseCode', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 98 },
    { id: 999, code: 'LastAPIResponseMessage', entity: MatchingEntityEnum.LEAD, type: BX_FIELD_TYPE.STRING, sort: 99 },
];
export default LEAD_FIELDS;
