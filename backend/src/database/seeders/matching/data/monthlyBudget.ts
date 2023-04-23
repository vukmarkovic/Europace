import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API monthly budget fields data
 * @see ApiField
 * @see MatchingSeederService.monthlyBudgetFields
 */
const MONTHLY_BUDGET_FIELDS: Partial<ApiField>[] = [
    {
        id: 501,
        code: MatchingEntityEnum.MONTHLY_BUDGET,
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 502, code: 'einnahmen.summeVariablerEinkuenfteMonatlich', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 1 },
    { id: 503, code: 'einnahmen.summeEhegattenunterhalt', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 2 },
    { id: 504, code: 'einnahmen.summeUnbefristeteZusatzrentenMonatlich.betrag', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 3 },
    { id: 505, code: 'einnahmen.summeSonstigeEinnahmenMonatlich.betrag', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 4 },
    {
        id: 506,
        code: 'einnahmen.einkuenfteAusNebentaetigkeit[].betragMonatlich',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.MONEY,
        sort: 5,
    },
    {
        id: 507,
        code: 'einnahmen.einkuenfteAusNebentaetigkeit[].beginnDerTaetigkeit',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.DATE,
        sort: 6,
    },
    { id: 508, code: 'ausgaben.summeMietausgaben.betragMonatlich', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 7 },
    { id: 509, code: 'ausgaben.summeMietausgaben.entfaelltMitFinanzierung', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.BOOL, sort: 8 },
    { id: 510, code: 'ausgaben.summePrivaterKrankenversicherungenMonatlich', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 9 },
    { id: 511, code: 'ausgaben.unterhaltsverpflichtungenMonatlich[]', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 10 },
    {
        id: 512,
        code: 'ausgaben.summeSonstigerVersicherungsausgabenMonatlich.betrag',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.MONEY,
        sort: 11,
    },
    { id: 513, code: 'ausgaben.summeSonstigerAusgabenMonatlich.betrag', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 12 },
    { id: 514, code: 'verbindlichkeiten.ratenkredite[].rateMonatlich', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 13 },
    { id: 515, code: 'vermoegen.summeBankUndSparguthaben.guthaben', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 14 },
    { id: 516, code: 'vermoegen.summeSparplaene.aktuellerWert', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 15 },
    { id: 517, code: 'vermoegen.summeDepotvermoegen.depotwert', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 16 },
    { id: 518, code: 'vermoegen.summeSonstigesVermoegen.aktuellerWert', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 17 },
    { id: 519, code: 'vermoegen.bausparvertraege.angesparterBetrag', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 18 },
    { id: 520, code: 'vermoegen.bausparvertraege.bausparkasse', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 19 },
    { id: 521, code: 'vermoegen.bausparvertraege.vertragsnummer', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 20 },
    { id: 522, code: 'vermoegen.bausparvertraege.tarif', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 21 },
    { id: 523, code: 'vermoegen.bausparvertraege.vertragsbeginn', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.DATE, sort: 22 },
    { id: 524, code: 'vermoegen.bausparvertraege.jahresentgelt', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 23 },
    { id: 525, code: 'vermoegen.bausparvertraege.sparbeitragMonatlich', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 24 },
    { id: 526, code: 'vermoegen.bausparvertraege.bausparsumme', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.MONEY, sort: 25 },
    { id: 527, code: 'vermoegen.bausparvertraege.zuteilungsdatum', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.DATE, sort: 26 },
    { id: 528, code: 'vermoegen.summeBankUndSparguthaben.verwendung.@type', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 27 },
    {
        id: 529,
        code: 'vermoegen.lebensOderRentenversicherungen.rueckkaufswert',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.MONEY,
        sort: 28
    },
    {
        id: 530,
        code: 'vermoegen.lebensOderRentenversicherungen.praemieMonatlich',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.MONEY,
        sort: 29
    },
    {
        id: 531,
        code: 'vermoegen.lebensOderRentenversicherungen.verwendung.@type',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.MONEY,
        sort: 30
    },
    { id: 532, code: 'zusatzangaben.kfzAnzahl', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.INTEGER, sort: 31 },
    { id: 533, code: 'zusatzangaben.zusatzangabenProProduktanbieter.@type', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 32 },
    {
        id: 534,
        code: 'zusatzangaben.zusatzangabenProProduktanbieter.lebenshaltungskostenMonatlich',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.MONEY,
        sort: 33
    },
    {
        id: 536,
        code: 'zusatzangaben.zusatzangabenProProduktanbieter.anzahlErwachseneImHaushalt',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.INTEGER,
        sort: 35
    },
    {
        id: 537,
        code: 'zusatzangaben.zusatzangabenProProduktanbieter.anzahlKinderNichtImHaushalt',
        entity: MatchingEntityEnum.MONTHLY_BUDGET,
        type: BX_FIELD_TYPE.INTEGER,
        sort: 36
    },
    { id: 538, code: 'finanzielleSituation.vermoegen.bausparvertraege.bausparkasse', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 37 },
    { id: 539, code: 'zusatzangaben.zusatzangabenProProduktanbieter(array[ZusatzangabenHaushaltIng]).@type', entity: MatchingEntityEnum.MONTHLY_BUDGET, type: BX_FIELD_TYPE.STRING, sort: 38 },
];
export default MONTHLY_BUDGET_FIELDS;
