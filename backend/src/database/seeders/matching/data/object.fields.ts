import ApiField from '../../../../modules/matching/models/entities/api.field.entity';
import MatchingEntityEnum from '../../../../common/enums/matching.entity.enum';
import BX_FIELD_TYPE from '../../../../modules/bxapi/models/constants/bx.field.type';
import BX_ENTITY from '../../../../modules/bxapi/models/constants/bx.entity';

/**
 * Europace API object fields data
 * @see ApiField
 * @see MatchingSeederService.objectFields
 */
const OBJECT_FIELDS: Partial<ApiField>[] = [
    {
        id: 701,
        code: MatchingEntityEnum.OBJECT,
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.INTEGER,
        base: true,
        default: BX_ENTITY.SMART_PROCESS,
        sort: 0,
     },
    // { id: 702, },
    // { id: 703, },
    // { id: 704, },
    // { id: 705, },
    // { id: 706, },
    // { id: 707, },
    // { id: 708, },
    { id: 709, code: 'finanzierungsobjekt.immobilie.adresse.strasse', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 8 },
    { id: 710, code: 'finanzierungsobjekt.immobilie.adresse.hausnummer', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 9 },
    { id: 711, code: 'finanzierungsobjekt.immobilie.adresse.plz', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 10 },
    { id: 712, code: 'finanzierungsobjekt.immobilie.adresse.ort', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 11 },
    { id: 713, code: 'finanzierungsobjekt.immobilie.typ.@type', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 12 },
    { id: 714, code: 'finanzierungsobjekt.immobilie.typ.grundstuecksgroesse', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.MONEY, sort: 13 },
    { id: 715, code: 'finanzierungsobjekt.immobilie.typ.grundstuecksart', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 14 },
    { id: 716, code: 'finanzierungsobjekt.immobilie.typ.gebaeude.baujahr', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.INTEGER, sort: 15 },
    { id: 717, code: 'finanzierungsobjekt.immobilie.typ.gebaeude.bauweise', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 16 },
    { id: 718, code: 'finanzierungsobjekt.immobilie.typ.gebaeude.anzahlGeschosse', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.INTEGER, sort: 17 },
    { id: 719, code: 'finanzierungsobjekt.immobilie.typ.gebaeude.zustand', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 18 },
    { id: 720, code: 'finanzierungsobjekt.immobilie.typ.gebaeude.ausstattung', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 19 },
    {
        id: 721,
        code: 'finanzierungsobjekt.immobilie.typ.gebaeude.nutzung.wohnen.gesamtflaeche',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 20
    },
    {
        id: 722,
        code: 'finanzierungsobjekt.immobilie.typ.gebaeude.nutzung.gewerbeErfassung.gewerbe.gesamtflaeche',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 21
    },
    {
        id: 723,
        code: 'finanzierungsobjekt.immobilie.typ.gebaeude.modernisierungErfassung.jahr',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.INTEGER,
        sort: 22
    },
    {
        id: 724,
        code: 'finanzierungsobjekt.immobilie.typ.gebaeude.modernisierungErfassung.grad',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 23
    },
    { id: 725, code: 'finanzierungsobjekt.immobilie.typ.einliegerwohnungVorhanden', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.BOOL, sort: 24 },
    { id: 726, code: 'finanzierungsobjekt.immobilie.typ.nutzflaechen.dachgeschoss', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 25 },
    { id: 727, code: 'finanzierungsobjekt.immobilie.typ.nutzflaechen.unterkellerung', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 26 },
    { id: 728, code: 'finanzierungsobjekt.immobilie.typ.fertighaus', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.BOOL, sort: 27 },
    { id: 730, code: 'typ.haustyp', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 29 },
    { id: 731, code: 'finanzierungsobjekt.immobilie.stellplaetzeErfassung.stellplaetze.typ', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 30 },
    { id: 732, code: 'finanzierungsobjekt.immobilie.stellplaetzeErfassung.stellplaetze.mieteMonatlich', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.MONEY, sort: 31 },
    { id: 733, code: 'finanzierungsobjekt.immobilie.erbbaurecht.erbbauzinsJaehrlich', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.MONEY, sort: 32 },
    {
        id: 734,
        code: 'finanzierungsobjekt.immobilie.erbbaurecht.grundstueckseigentuemer',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 33
    },
    { id: 735, code: 'finanzierungsobjekt.immobilie.erbbaurecht.laufzeitBis', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.INTEGER, sort: 34 },
    { id: 736, code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.ort', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 35 },
    { id: 737, code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.blatt', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 36 },
    {
        id: 738,
        code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.flurstuecke[].flur',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 37
    },
    {
        id: 739,
        code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.flurstuecke[].flurstueck',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 38
    },
    {
        id: 740,
        code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.flurstuecke[].anteil.anteil',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 39
    },
    {
        id: 741,
        code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.flurstuecke[].anteil.gesamt',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.INTEGER,
        sort: 40
    },
    {
        id: 742,
        code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.flurstuecke[].groesse',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 41
    },
    {
        id: 743,
        code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.rechteInAbteilung2.beschreibung',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 42
    },
    {
        id: 744,
        code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.rechteInAbteilung2.betrag',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 43
    },
    { id: 745, code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.anmerkungen', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 44 },
    {
        id: 746,
        code: 'finanzierungsobjekt.immobilie.zusatzangaben.beleihungswertangaben.marktueblicherKaufpreisProQm',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 45
    },
    {
        id: 747,
        code: 'finanzierungsobjekt.immobilie.zusatzangaben.beleihungswertangaben.keinBaulandFlaeche',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 46
    },
    {
        id: 748,
        code: 'finanzierungsobjekt.immobilie.zusatzangaben.beleihungswertangaben.bodenrichtwert',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 47
    },
    {
        id: 749,
        code: 'finanzierungsobjekt.immobilie.zusatzangaben.beleihungswertangaben.wohnlage',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 48
    },
    {
        id: 750,
        code: 'finanzierungsobjekt.immobilie.zusatzangaben.beleihungswertangaben.kubatur',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.DOUBLE,
        sort: 49
    },
    {
        id: 751,
        code: 'finanzierungsobjekt.immobilie.zusatzangaben.beleihungswertangaben.vergleichsmieteFuerWohnflaecheProQm',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 50
    },
    {
        id: 752,
        code: 'finanzierungsobjekt.immobilie.zusatzangaben.beleihungswertangaben.vergleichsmieteFuerGewerbeflaecheProQm',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 51
    },
    {
        id: 753,
        code: 'finanzierungsbedarf.finanzierungszweck.marktwertFinanzierungsobjekt',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 52
    },
    {
        id: 754,
        code: 'finanzierungsbedarf.finanzierungszweck.modernisierung.renovierungskosten',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 53
    },
    {
        id: 755,
        code: 'finanzierungsbedarf.finanzierungszweck.modernisierung.eigenleistung',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 54
    },
    {
        id: 756,
        code: 'finanzierungsbedarf.finanzierungszweck.weitereKosten.mobiliarkosten',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 55
    },
    {
        id: 757,
        code: 'finanzierungsbedarf.finanzierungszweck.weitereKosten.sonstigeKosten.betrag',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 56
    },
    {
        id: 758,
        code: 'finanzierungsbedarf.finanzierungszweck.weitereKosten.beglicheneKosten',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 57
    },
    {
        id: 759,
        code: 'finanzierungsbedarf.finanzierungszweck.nebenkosten.maklergebuehr.wert',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 58
    },
    {
        id: 760,
        code: 'finanzierungsbedarf.finanzierungszweck.nebenkosten.maklergebuehr.einheit',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 59
    },
    {
        id: 761,
        code: 'finanzierungsbedarf.finanzierungszweck.nebenkosten.notargebuehr.wert',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 60
    },
    {
        id: 762,
        code: 'finanzierungsbedarf.finanzierungszweck.nebenkosten.notargebuehr.einheit',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 61
    },
    {
        id: 763,
        code: 'finanzierungsbedarf.finanzierungszweck.nebenkosten.grunderwerbsteuer.wert',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.MONEY,
        sort: 62
    },
    {
        id: 764,
        code: 'finanzierungsbedarf.finanzierungszweck.nebenkosten.grunderwerbsteuer.einheit',
        entity: MatchingEntityEnum.OBJECT,
        type: BX_FIELD_TYPE.STRING,
        sort: 63
    },
    { id: 765, code: 'finanzierungsbedarf.finanzierungszweck.kaufpreis', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.MONEY, sort: 64 },
    { id: 766, code: 'finanzierungsbedarf.finanzierungszweck.eigenleistung', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.MONEY, sort: 65 },
    { id: 767, code: 'finanzierungsbedarf.finanzierungszweck.aussenanlagen', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.MONEY, sort: 66 },
    { id: 768, code: 'finanzierungsbedarf.finanzierungszweck.baunebenkosten', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.MONEY, sort: 67 },
    { id: 769, code: 'zusatzangaben.beleihungswertangaben.vergleichsmieteFuerGewerbeflaecheProQm', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.BOOL, sort: 68 },
    { id: 770, code: 'finanzierungsobjekt.immobilie.typ.anzahlDerWohneinheitenImObjekt', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.DOUBLE, sort: 69 },
    { id: 771, code: 'finanzierungsobjekt.immobilie.grundbuchangabeErfassung.amtsgericht', entity: MatchingEntityEnum.OBJECT, type: BX_FIELD_TYPE.STRING, sort: 70 },
];
export default OBJECT_FIELDS;
