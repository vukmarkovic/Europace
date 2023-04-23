import { IEuropaceExistingProperty } from './europace..existingProperty.response';
import { IEuropaceBankAccount } from './europace.bankAccount';
import { IEuropaceChildren } from './europace.children';
import { IEuropaceCustomer } from './europace.customer';

/**
 * Interface representing Europace case data.
 * @see IApiResponseFields
 */
export interface IEuropaceCase {
    haushalte: [
        {
            kunden: IEuropaceCustomer[];
            kinderErfassung: {
                '@type': 'VORHANDENE_KINDER';
                kinder: IEuropaceChildren[];
            };
            finanzielleSituation: {
                bestehendeImmobilienErfassung: {
                    '@type': string;
                    bestehendeImmobilien: IEuropaceExistingProperty[];
                };
                vermoegen: {
                    summeBankUndSparguthaben: {
                        guthaben: number;
                        zinsertragJaehrlich: number;
                        verwendung: {
                            '@type': string;
                            maximalEinzusetzenderBetrag: number;
                            kommentar: string;
                        };
                    };
                    summeSparplaene: {
                        aktuellerWert: number;
                        betragMonatlich: number;
                        verwendung: {
                            '@type': string;
                            kommentar: string;
                        };
                    };
                    summeDepotvermoegen: {
                        depotwert: 130345.5;
                        verwendung: {
                            '@type': string;
                            maximalEinzusetzenderBetrag: number;
                            kommentar: string;
                        };
                    };
                    bausparvertraege: [
                        {
                            angesparterBetrag: number;
                            bausparkasse: string;
                            vertragsnummer: string;
                            tarif: string;
                            vertragsbeginn: string;
                            jahresentgelt: number;
                            sparbeitragMonatlich: number;
                            bausparsumme: number;
                            zuteilungsdatum: string;
                            verwendung: {
                                '@type': string;
                                maximalEinzusetzenderBetrag: number;
                                kommentar: string;
                            };
                        },
                    ];
                    lebensOderRentenversicherungen: [
                        {
                            rueckkaufswert: number;
                            praemieMonatlich: number;
                            verwendung: {
                                '@type': string;
                                kommentar: string;
                            };
                            detailsWennZusatzsicherheit: {
                                versicherungsgesellschaft: string;
                                vertragsnummer: string;
                                tarif: string;
                                vertragsdatum: string;
                                vertragsende: string;
                                versicherungsart: string;
                                versicherungssumme: number;
                                verwaltungsgebuehrenJaehrlich: number;
                            };
                        },
                    ];
                    summeSonstigesVermoegen: {
                        aktuellerWert: number;
                        verwendung: {
                            '@type': string;
                            maximalEinzusetzenderBetrag: number;
                            kommentar: string;
                        };
                    };
                };
                einnahmen: {
                    summeEinkuenfteAusKapitalvermoegen: number;
                    summeVariablerEinkuenfteMonatlich: number;
                    einkuenfteAusNebentaetigkeit: [
                        {
                            betragMonatlich: number;
                            beginnDerTaetigkeit: string;
                        },
                    ];
                    summeEhegattenunterhalt: number;
                    summeUnbefristeteZusatzrentenMonatlich: {
                        betrag: number;
                        kommentar: string;
                    };
                    summeSonstigeEinnahmenMonatlich: {
                        betrag: number;
                        kommentar: string;
                    };
                };
                ausgaben: {
                    summeMietausgaben: {
                        betragMonatlich: number;
                        entfaelltMitFinanzierung: true;
                    };
                    summePrivaterKrankenversicherungenMonatlich: number;
                    unterhaltsverpflichtungenMonatlich: number[];
                    summeSonstigerVersicherungsausgabenMonatlich: {
                        betrag: number;
                        kommentar: string;
                    };
                    summeSonstigerAusgabenMonatlich: {
                        betrag: number;
                        kommentar: string;
                    };
                };
                verbindlichkeiten: {
                    ratenkredite: [
                        {
                            rateMonatlich: number;
                            glaeubiger: string;
                            laufzeitende: string;
                            restschuld: number;
                            wirdAbgeloest: true;
                            kommentar: string;
                        },
                    ];
                    privatdarlehen: [
                        {
                            rateMonatlich: number;
                            glaeubiger: string;
                            laufzeitende: string;
                            restschuld: number;
                            wirdAbgeloest: true;
                            kommentar: string;
                        },
                    ];
                    sonstigeVerbindlichkeit: {
                        rateMonatlich: number;
                        glaeubiger: string;
                        laufzeitende: string;
                        restschuld: number;
                        wirdAbgeloest: true;
                        kommentar: string;
                    };
                };
            };
            zusatzangaben: {
                kfzAnzahl: 2;
                zusatzangabenProProduktanbieter: [
                    {
                        '@type': 'ZUSATZANGABEN_HAUSHALT_DSL';
                        lebenshaltungskostenMonatlich: 1650.0;
                    },
                    {
                        '@type': 'ZUSATZANGABEN_HAUSHALT_ING';
                        anzahlErwachseneImHaushalt: 2;
                        anzahlKinderNichtImHaushalt: 1;
                    },
                    {
                        '@type': 'ZUSATZANGABEN_HAUSHALT_SANTANDER';
                        vermoegen: {
                            bankUndSparguthaben: {
                                guthaben: 123.0;
                                kontonummer: 'konto1';
                            };
                            wertpapiereAktien: {
                                guthaben: 234.0;
                                kontonummer: 'konto2';
                            };
                            bausparvertrag: {
                                guthaben: 345.0;
                                kontonummer: 'konto3';
                            };
                            sonstigesVermoegen: {
                                guthaben: 456.0;
                                kontonummer: 'konto4';
                            };
                            lebensversicherungKapitalgebunden: {
                                guthaben: 567.0;
                                kontonummer: 'konto5';
                            };
                            rentenversicherungKapitalgebunden: {
                                guthaben: 678.0;
                                kontonummer: 'konto6';
                            };
                            lebensversicherungFondsgebunden: {
                                guthaben: 789.0;
                                kontonummer: 'konto7';
                            };
                            rentenversicherungFondsgebunden: {
                                guthaben: 888.0;
                                kontonummer: 'konto8';
                            };
                        };
                        verbindlichkeiten: {
                            konsumentenkredit: {
                                hoehe: 987.0;
                                kontonummer: 'konto11';
                                anrechnungFuerBlankoanteil: 12.0;
                            };
                            dispokredit: {
                                hoehe: 876.0;
                                kontonummer: 'konto22';
                                anrechnungFuerBlankoanteil: 13.0;
                            };
                            kreditkarte: {
                                hoehe: 765.0;
                                kontonummer: 'konto33';
                                anrechnungFuerBlankoanteil: 14.0;
                            };
                            kkKredit: {
                                hoehe: 654.0;
                                kontonummer: 'konto44';
                                anrechnungFuerBlankoanteil: 15.0;
                            };
                            immobilienkredit: {
                                hoehe: 543.0;
                                kontonummer: 'konto55';
                                anrechnungFuerBlankoanteil: 16.0;
                            };
                            buergschaft: {
                                hoehe: 432.0;
                                kontonummer: 'konto66';
                                anrechnungFuerBlankoanteil: 17.0;
                            };
                            kfwHausbankenwechsel: {
                                hoehe: 321.0;
                                kontonummer: 'konto77';
                                anrechnungFuerBlankoanteil: 18.0;
                            };
                        };
                        bemerkungen: 'Kommentar 123ec874-bf91-41f6-8d3e-8a080a18dabc';
                    },
                ];
            };
        },
    ];
    finanzierungsobjekt: {
        immobilie: {
            adresse: {
                strasse: 'Immobilienstraße';
                hausnummer: '16';
                plz: '82784';
                ort: 'Spandau';
            };
            typ: {
                '@type': 'EINFAMILIENHAUS';
                grundstuecksgroesse: 620.4;
                gebaeude: {
                    baujahr: 2018;
                    bauweise: 'GLAS_STAHL';
                    anzahlGeschosse: 1;
                    zustand: 'MAESSIG';
                    ausstattung: 'MITTEL';
                    nutzung: {
                        wohnen: {
                            gesamtflaeche: 121.1;
                            nutzungsart: {
                                '@type': 'TEILVERMIETET';
                                vermieteteFlaeche: 93.2;
                                mieteinnahmenNettoKaltMonatlich: 601.3;
                            };
                        };
                        gewerbeErfassung: {
                            '@type': 'VORHANDENES_GEWERBE';
                            gewerbe: {
                                gesamtflaeche: 101.7;
                                nutzungsart: {
                                    '@type': 'VERMIETET';
                                    mieteinnahmenNettoKaltMonatlich: 701.9;
                                };
                            };
                        };
                    };
                    modernisierungErfassung: {
                        '@type': 'VORHANDENE_MODERNISIERUNG';
                        jahr: 2015;
                        grad: 'HOCH';
                    };
                };
                einliegerwohnungVorhanden: true;
                nutzflaechen: {
                    dachgeschoss: 'FLACHDACH';
                    unterkellerung: 'TEILWEISE_UNTERKELLERT';
                };
                fertighaus: true;
            };
            stellplaetzeErfassung: {
                '@type': 'VORHANDENE_STELLPLAETZE';
                stellplaetze: [
                    {
                        typ: 'CARPORT';
                        vermietungErfassung: {
                            '@type': 'VORHANDENE_STELLPLATZ_VERMIETUNG';
                            mieteMonatlich: 81.6;
                        };
                    },
                ];
            };
            erbbaurechtErfassung: {
                '@type': 'VORHANDENES_ERBBAURECHT';
                erbbauzinsJaehrlich: 3000.2;
                grundstueckseigentuemer: 'OEFFENTLICH_KIRCHLICH';
                laufzeitBis: 2037;
            };
            grundbuchangabeErfassung: {
                '@type': 'VORHANDENE_GRUNDBUCHANGABE';
                ort: 'Grundbuch Ort 2';
                blatt: '72';
                amtsgericht: 'Amtsgericht';
                flurstuecke: [
                    {
                        flur: '2. OG';
                        flurstueck: '71';
                        anteil: {
                            anteil: 13.2;
                            gesamt: 14;
                        };
                        groesse: 81.3;
                    },
                ];
                rechteInAbteilung2: {
                    '@type': 'VORHANDENE_RECHTE_ABTEILUNG_2';
                    betrag: 110000.4;
                    beschreibung: 'Rechte Abteilung 2 Beschreibung 2';
                };
                anmerkungen: 'Anmerkung ff0a01a3-3c54-42b3-832e-9ba92f4ee844';
            };
            zusatzangaben: {
                beleihungswertangaben: {
                    marktueblicherKaufpreisProQm: 100000.0;
                    keinBaulandFlaeche: 20.0;
                    bodenrichtwert: 20000.0;
                    wohnlage: 'MITTEL';
                    kubatur: 30.0;
                    vergleichsmieteFuerWohnflaecheProQm: 13.0;
                    vergleichsmieteFuerGewerbeflaecheProQm: 9.0;
                };
                effektivzinsErhoehendeKosten: {
                    wohngebaeudeversicherungskostenJaehrlich: 300.0;
                    grundbucheintragungskostenEinmalig: 1000.0;
                    sonstigeKosten: {
                        bezeichnung: 'SonstigeEffektivzinsErhoehendeKosten123';
                        betragEinmalig: 3000.0;
                    };
                };
                modernisierung: {
                    kernsanierung: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    dacherneuerung: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    fenster: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    rohrleitungen: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    heizung: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    waermedaemmung: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    baeder: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    innenausbau: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                    raumaufteilung: {
                        jahr: 2020;
                        grad: 'UMFASSEND';
                    };
                };
                zusatzangabenProProduktanbieter: [
                    {
                        '@type': 'ZUSATZANGABEN_IMMOBILIE_DSL';
                        bewirtschaftungskostenJaehrlich: 200.0;
                    },
                    {
                        '@type': 'ZUSATZANGABEN_IMMOBILIE_GENOPACE';
                        anpassungenNachBelWertV: {
                            beleihungswertangaben: {
                                allgemeineWertermittlung: {
                                    restnutzungsdauerInJahren: 3;
                                    abzugZurWerteanpassung: {
                                        betrag: 100.0;
                                        grund: 'Grund123';
                                    };
                                    sicherheitsabschlag: 2.0;
                                    eigennutzungsfaehigkeit: true;
                                    stellplatz: 20.0;
                                    carport: 50.0;
                                    garage: 30.0;
                                    tiefgarage: 60.0;
                                };
                                erbbaurecht: {
                                    liegenschaftszins: 2.0;
                                    gebaeudeEntschaedigungBeiAblauf: 2.5;
                                };
                            };
                            sachwertErmittlung: {
                                aussenanlagen: 2.0;
                                baunebenkosten: 3.0;
                                regionalfaktor: 4.0;
                                sachwertfaktorNachhaltigkeitsfaktor: 5.0;
                            };
                            ertragswertErmittlung: {
                                wohnwirtschaftlich: {
                                    angaben: {
                                        liegenschaftszins: 10.0;
                                        kapitalisierungszins: 11.0;
                                        verwaltungskosten: 12.0;
                                        instandhaltungskosten: 13.0;
                                        mietausfallwagnis: 14.0;
                                        nichtUmlagefaehigeBetriebskosten: 15.0;
                                        modernisierungsrisiko: 16.0;
                                    };
                                    bewirtschaftungskostenGarage: 10.0;
                                    bewirtschaftungskostenStellplaetze: 12.0;
                                };
                                gewerblich: {
                                    liegenschaftszins: 10.0;
                                    kapitalisierungszins: 11.0;
                                    verwaltungskosten: 12.0;
                                    instandhaltungskosten: 13.0;
                                    mietausfallwagnis: 14.0;
                                    nichtUmlagefaehigeBetriebskosten: 15.0;
                                    modernisierungsrisiko: 16.0;
                                };
                            };
                            begruendungFuerAenderungen: 'grund123';
                        };
                    },
                    {
                        '@type': 'ZUSATZANGABEN_IMMOBILIE_ING';
                        beleihungsobjekt: {
                            '@type': 'ING_HAUS';
                            gebaude: {
                                ausstattung: 'GEHOBEN';
                                kellerausbau: 'AUSGEBAUT';
                                aufzugVorhanden: true;
                                modernisierungsangaben: {
                                    bodenWandTreppe: true;
                                    heizungZentral: true;
                                    fenster: true;
                                    dach: true;
                                    badWc: true;
                                    stromAbwasserHeizkoerper: true;
                                    waermedaemmung: true;
                                    raumaufteilung: true;
                                };
                            };
                        };
                    },
                    {
                        '@type': 'ZUSATZANGABEN_IMMOBILIE_SANTANDER';
                        vorlaeufigerVerkehrswert: 500000.0;
                    },
                ];
            };
        };
        darlehenslisteErfassung: {
            '@type': 'VORHANDENE_BESTEHENDE_DARLEHEN_DES_FINANZIERUNGSOBJEKTES';
            darlehensliste: [
                {
                    referenzId: '631f1f200cf8f78e2758c29e';
                    darlehen: {
                        '@type': 'BESTEHENDES_BAUSPARDARLEHEN';
                        grundschuldart: 'BUCH_GRUNDSCHULD';
                        darlehensgeber: {
                            '@type': 'PRODUKTANBIETER_DARLEHENSGEBER';
                            produktanbieter: 'ABAKUS_BANK';
                        };
                        grundschuld: 501000.6;
                        darlehensbetrag: 201000.5;
                        rateMonatlich: 851.8;
                        sollzins: 4.1;
                        zinsbindungBis: '2031-01-17';
                        laufzeitende: '2036-02-22';
                        restschuld: {
                            aktuell: 151000.7;
                            zumAbloesetermin: 10100.9;
                        };
                        darlehenskontonummer: 'DE78912345678';
                    };
                },
            ];
        };
    };
    finanzierungsbedarf: {
        finanzierungszweck: {
            '@type': 'ANSCHLUSSFINANZIERUNG';
            bereitsBeglicheneKosten: 5023.5;
            modernisierungskostenErfassung: {
                '@type': 'VORHANDENE_MODERNISIERUNGSKOSTEN';
                modernisierungskostenInklEigenleistungen: 40000.0;
                renovierungskosten: 10000.0;
                eigenleistungErfassung: {
                    '@type': 'VORHANDENE_EIGENLEISTUNG';
                    eigenleistung: 3000.0;
                };
            };
            zuBeschaffendesKapitalErfassung: {
                '@type': 'KEIN_ZU_BESCHAFFENDES_KAPITAL';
            };
            marktwertFinanzierungsobjekt: 350000.0;
            abloesungDarlehenDesFinanzierungsobjektes: [
                {
                    referenzIdAbzuloesendesDarlehen: '631f1f200cf8f78e2758c29e';
                    sondertilgungZumZinsbindungsende: 121000.4;
                    referenzIdFinanzierungsbaustein: '631f1f20cf50cb20a1179b3e';
                },
            ];
        };
        beratungshonorar: 1001.2;
        unbesicherteExterneDarlehen: [
            {
                typ: 'ARBEITGEBERDARLEHEN';
                darlehensgeber: 'Der Darlehensgeber';
                betrag: 10300.6;
                rateMonatlich: 1234.5;
                zinsbindungsende: '2031-06-12';
                laufzeitende: '2030-05-18';
                kommentar: 'Kommentar ddc999bb-dbe2-4087-8c65-928360fa6849';
            },
        ];
        praeferenzen: {
            finanzierungsdetailspraeferenzen: {
                zinsbindung: {
                    '@type': 'ZINSBINDUNGSSPANNE';
                    vonJahre: 10;
                    bisJahre: 15;
                    kommentar: 'Kommentar f4823c55-6bb8-4a4b-af91-8e3cc16172ea';
                };
                laufzeit: {
                    '@type': 'MOEGLICHST_SCHNELL';
                    kommentar: 'Kommentar 9fb18630-9ccf-4c67-91a3-17e04e8689c6';
                };
                ratenhoehe: {
                    '@type': 'WARMMIETE_VON_HEUTE';
                    kommentar: 'Kommentar 05934da4-ceca-4382-97c5-30054244b6e4';
                };
                tilgungssatzwechsel: {
                    '@type': 'NICHT_EINGEPLANT_ODER_ABSEHBAR';
                    kommentar: 'Kommentar 1872a8b7-dd36-4cb1-b8ae-7e72878b7ff3';
                };
                sondertilgung: {
                    '@type': 'EURO_JAEHRLICH';
                    betrag: 23456.8;
                    kommentar: 'Kommentar 4124206c-822c-4acc-8783-a1427bab8163';
                };
                bereitstellungszinsfreieZeit: {
                    '@type': 'IN_MONATEN';
                    monate: 6;
                    kommentar: 'Kommentar 310cab02-a728-4dd3-a8f4-c8eb428d7b92';
                };
            };
            bestandteileDerFinanzierung: {
                praeferenz: 'KONKRETE_VORSTELLUNGEN';
                kommentar: 'Kommentar 1a42fee5-1d60-42fc-b625-022bafed431c';
            };
            absicherungUndVorsorge: {
                praeferenz: 'KEINE_PRAEFERENZ';
                kommentar: 'Kommentar abff9f91-9074-4930-9165-4567879a11a7';
            };
            zeitlicherRahmen: {
                '@type': 'SO_SCHNELL_WIE_MOEGLICH';
                kommentar: 'Kommentar c8f9552c-0fa0-4f14-9706-d53a7c7c06bf';
            };
            girokonto: {
                bestehendeGirokontenBeiBanken: ['Bank e50d6e40-82ef-4ef4-81dc-068c45bf43d8', 'Bank 093e4850-1d63-4d4a-9a8a-46181dde3679'];
                wechselbereitZumDarlehensgeber: true;
            };
            weiterePraeferenz: 'Weitere Präferenz f32a9157-c3dc-4c09-b873-cadfd999c2f3';
        };
        finanzierungsbausteine: [
            {
                '@type': 'ANNUITAETENDARLEHEN';
                referenzId: '631f1f20cf50cb20a1179b3e';
                darlehensbetrag: 234567.8;
                annuitaetendetails: {
                    zinsbindungInJahren: 10;
                    tilgungswunsch: {
                        '@type': 'RATE';
                        rate: 1567.9;
                        tilgungsbeginn: '2020-09-20';
                    };
                    sondertilgungJaehrlich: 5.8;
                    auszahlungszeitpunkt: '2021-07-19';
                };
                bereitstellungszinsfreieZeitInMonaten: 6;
                kundenreferenzIdDerRiesterGefoerdertenPerson: '631f1f2052d7c058629fc3eb';
                provision: 4.1;
            },
        ];
        ratenschutzbausteine: [
            {
                kundenreferenzIdDerVersichertenPerson: '631f1f20c7f23c5cf01d59fd';
                versicherungsbeginn: '2020-09-13';
                versicherungsdauerInJahren: 7;
                praemienzahlung: {
                    '@type': 'EINMALIGE_PRAEMIENZAHLUNG';
                    absicherungsfinanzierungsweise: 'DURCH_HAUPTDARLEHEN';
                };
                risikoabsicherungswuensche: [
                    {
                        abzusicherndesRisiko: 'ARBEITSLOSIGKEIT';
                        versicherungssumme: 34567.1;
                        versicherteRate: 50.2;
                    },
                    {
                        abzusicherndesRisiko: 'ARBEITSUNFAEHIGKEIT';
                        versicherungssumme: 45678.1;
                        versicherteRate: 60.2;
                    },
                ];
            },
        ];
    };
    bankverbindung: IEuropaceBankAccount;
}
