import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API existing property object fields data
 * @see ApiField
 * @see MatchingSeederService.existingPropertyFields
 */
const EXISTING_PROPERTY_FIELDS: Partial<ApiField>[] = [
    {
        id: 1201,
        code: MatchingEntityEnum.EXISTING_PROPERTY,
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
    },
    { id: 1202, code: 'bezeichnung', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 1 },
    { id: 1203, code: 'marktwert', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.MONEY, sort: 2 },
    { id: 1204, code: 'immobilie.adresse.strasse', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 3 },
    { id: 1205, code: 'immobilie.adresse.hausnummer', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 4 },
    { id: 1206, code: 'immobilie.adresse.plz', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.INTEGER, sort: 5 },
    { id: 1207, code: 'immobilie.adresse.ort', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 6 },
    { id: 1208, code: 'immobilie.typ.@type', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 7 },
    { id: 1209, code: 'immobilie.typ.anzahlDerWohneinheitenImObjekt', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.INTEGER, sort: 8 },
    { id: 1210, code: 'immobilie.typ.grundstuecksgroesse', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.DOUBLE, sort: 9 },
    { id: 1211, code: 'immobilie.typ.gebaeude.baujahr', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.INTEGER, sort: 10 },
    { id: 1212, code: 'immobilie.typ.gebaeude.bauweise', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 11 },
    { id: 1213, code: 'immobilie.typ.gebaeude.anzahlGeschosse', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.INTEGER, sort: 12 },
    {
        id: 1214,
        code: 'beleihungswertangaben.vergleichsmieteFuerWohnflaecheProQm',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 13
    },
    { id: 1215, code: 'immobilie.typ.gebaeude.nutzung.wohnen.nutzungsart.@type', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 14 },
    {
        id: 1216,
        code: 'beleihungswertangaben.vergleichsmieteFuerGewerbeflaecheProQm',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.BOOL,
        sort: 15
    },
    { id: 1217, code: 'immobilie.erbbaurecht', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.BOOL, sort: 16 },
    { id: 1218, code: 'immobilie.typ.gebaeude.zustand', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 17 },
    { id: 1219, code: 'immobilie.typ.gebaeude.ausstattung', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 18 },
    { id: 1220, code: 'immobilie.erbbaurecht.grundstueckseigentuemer', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 19 },
    { id: 1221, code: 'grundstuecksart', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 20 },
    { id: 1222, code: 'immobilie.typ.gebaeude.nutzung.wohnen.gesamtflaeche', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.DOUBLE, sort: 21 },
    { id: 1223, code: 'modernisierung(Modernisierung).jahr', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.INTEGER, sort: 22 },
    { id: 1224, code: 'modernisierung(Modernisierung).grad', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 23 },
    { id: 1225, code: 'nutzflaechen(Nutzflaechen).dachgeschoss', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 24 },
    { id: 1226, code: 'nutzflaechen(Nutzflaechen).unterkellerung', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 25 },
    { id: 1227, code: 'fertighaus', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.BOOL, sort: 26 },
    { id: 1228, code: 'erbbaurecht(Erbbaurecht).erbbauzinsJaehrlich', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.DOUBLE, sort: 27 },
    { id: 1229, code: 'erbbaurecht(Erbbaurecht).grundstueckseigentuemer', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 28 },
    { id: 1230, code: 'erbbaurecht(Erbbaurecht).laufzeitBis', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 29 },
    { id: 1231, code: 'grundbuchangabe(Grundbuchangabe).ort', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 30 },
    { id: 1232, code: 'grundbuchangabe(Grundbuchangabe).blatt', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 31 },
    { id: 1233, code: 'grundbuchangabe(Grundbuchangabe).amtsgericht', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 32 },
    { id: 1234, code: 'rechteInAbteilung2(RechteAbteilung2).beschreibung', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 33 },
    { id: 1235, code: 'rechteInAbteilung2(RechteAbteilung2).betrag', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.DOUBLE, sort: 34 },
    { id: 1236, code: 'grundbuchangabe(Grundbuchangabe).anmerkungen', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.STRING, sort: 35 },
    {
        id: 1237,
        code: 'beleihungswertangaben(Beleihungswertangaben).marktueblicherKaufpreisProQm',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 36
    },
    {
        id: 1238,
        code: 'beleihungswertangaben(Beleihungswertangaben).keinBaulandFlaeche',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 37
    },
    {
        id: 1239,
        code: 'beleihungswertangaben(Beleihungswertangaben).bodenrichtwert',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 38
    },
    {
        id: 1240,
        code: 'beleihungswertangaben(Beleihungswertangaben).wohnlage',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.STRING,
        sort: 39
    },
    {
        id: 1241,
        code: 'beleihungswertangaben(Beleihungswertangaben).kubatur',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 40
    },
    {
        id: 1242,
        code: 'beleihungswertangaben(Beleihungswertangaben).vergleichsmieteFuerWohnflaecheProQm',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 41
    },
    {
        id: 1243,
        code: 'beleihungswertangaben(Beleihungswertangaben).vergleichsmieteFuerGewerbeflaecheProQm',
        entity: MatchingEntityEnum.EXISTING_PROPERTY,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 42
    },
    { id: 1244, code: 'einliegerwohnungVorhanden', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.BOOL, sort: 43 },
    { id: 1245, code: 'marktwertFinanzierungsobjekt', entity: MatchingEntityEnum.EXISTING_PROPERTY, type: BX_FIELD_TYPE.DOUBLE, sort: 44 },
];
export default EXISTING_PROPERTY_FIELDS;
