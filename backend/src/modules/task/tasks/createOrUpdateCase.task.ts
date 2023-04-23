import { Injectable, Logger } from '@nestjs/common';
import MatchingEntityEnum from '../../../common/enums/matching.entity.enum';
import { Auth } from '../../../common/modules/auth/model/entities/auth.entity';
import { IEuropaceApplicantMatching } from '../../europace/models/interfaces/matching/europace.applicant.matching';
import { IEuropaceBankAccountMatching } from '../../europace/models/interfaces/matching/europace.bankAccount.matching';
import { IEuropaceChildrenMatching } from '../../europace/models/interfaces/matching/europace.children.matching';
import { IEuropaceCustomerMatching } from '../../europace/models/interfaces/matching/europace.customer.matching';
import { IEuropaceExistingPropertyMatching } from '../../europace/models/interfaces/matching/europace.existingProperty.matching';
import { IEuropaceJobMatching } from '../../europace/models/interfaces/matching/europace.job.matching';
import { IEuropaceLeadMatching } from '../../europace/models/interfaces/matching/europace.lead.matching';
import { IEuropaceMonthlyBudgetMatching } from '../../europace/models/interfaces/matching/europace.monthlyBudget';
import { IEuropaceObjectMatching } from '../../europace/models/interfaces/matching/europace.object.matching';
import { IEuropacePassportMatching } from '../../europace/models/interfaces/matching/europace.passport.matching';
import { ErrorHandler } from '../../../common/modules/errorhandler/error.handler.service';
import EuropaceService from '../../../modules/europace/europace.service';
import MatchingService from '../../../modules/matching/matching.service';
import TaskHelper from '../utils/task.helper';
import BX_ENTITY from '../../../modules/bxapi/models/constants/bx.entity';
import { writeFileSync } from 'fs';
import { BxApiService } from '../../bxapi/bx.api.service';

@Injectable()
export default class CreateOrUpdateCaseTask {
    private readonly logger = new Logger(CreateOrUpdateCaseTask.name);

    constructor(
        private readonly matching: MatchingService,
        private readonly helper: TaskHelper,
        private readonly europaceService: EuropaceService,
        private readonly errorHandler: ErrorHandler,
        private readonly bx: BxApiService
    ) {}

    /**
     * Sync data from Europace API to Bitrix24 by specified credentials ID.
     * Credentials ID stored in Task data field.
     *
     * @param auth - Bitrix24 auth data.
     * @param spId - lead smart process.
     * @param entityTypeId - lead smart process type id.
     * @param requestAuth - auth token of caller
     * @param skipUpdate - whether update should not be executed
     * @throws MatchException if matching is incorrect.
     * @see MatchingService
     * @see EuropaceService
     * @see BxApiService
     */
    async process(auth: Auth, spId: string, entityTypeId: string, requestAuth: string, skipUpdate = false) {
        if (!spId?.length || !entityTypeId?.length) return;

        const lead = await this.getLeadToSend(auth, spId);

        const [ownerTokenData, ownerPartnerId] = await this.helper.getEuropaceToken(auth, lead.assignedById);
        const [editorTokenData, editorPartnerId] = await this.getEditorToken(auth, requestAuth);
        await this.europaceService.updateEditor(auth, lead.id, ownerTokenData.access_token, editorPartnerId);

        const tokenData = lead.id?.length ? editorTokenData : ownerTokenData;
        const partnerId = lead.id?.length ? editorPartnerId : ownerPartnerId;

        if (lead.id?.length && skipUpdate) {
            return [lead.id, tokenData, partnerId]
        }

        const customers = await this.matching.prepareListWithLinkedData<IEuropaceCustomerMatching>(auth, MatchingEntityEnum.CUSTOMER, {
            filter: {
                ID: lead.contactIds,
            },
        });

        const childs = await this.matching.prepareListWithLinkedData<IEuropaceChildrenMatching>(auth, MatchingEntityEnum.CHILDREN, {
            filter: {
                [`parentId${entityTypeId}`]: lead.LEAD,
            },
        });

        const bankAccount = await this.matching.prepareListWithLinkedData<IEuropaceBankAccountMatching>(auth, MatchingEntityEnum.BANK_ACCOUNT, {
            filter: {
                [`parentId${entityTypeId}`]: lead.LEAD,
            },
        });

        const applicants = await this.matching.prepareListWithLinkedData<IEuropaceApplicantMatching>(auth, MatchingEntityEnum.APPLICANT, {
            filter: {
                [`parentId${entityTypeId}`]: lead.LEAD,
            },
        });

        const applicantsIds = applicants.map((x) => x.APPLICANT);

        const { entityTypeId: applicantEntityTypeId } = await this.helper.getMatch<IEuropaceApplicantMatching>(
            auth,
            MatchingEntityEnum.APPLICANT,
            'referenzId',
        );

        const arrJob = applicantsIds.length
            ? await this.matching.prepareListWithLinkedData<IEuropaceJobMatching>(auth, MatchingEntityEnum.JOB, {
                  filter: {
                      [`parentId${applicantEntityTypeId}`]: applicantsIds,
                  },
              })
            : [];

        const job = arrJob?.length ? arrJob[0] : null;

        await this.getExistingProperties(auth, applicantEntityTypeId, applicantsIds, lead);

        const passportDatas = applicantsIds.length
            ? await this.matching.prepareListWithLinkedData<IEuropacePassportMatching>(auth, MatchingEntityEnum.PASSPORT, {
                  filter: {
                      [`parentId${applicantEntityTypeId}`]: applicantsIds,
                  },
              })
            : [];

        await this.getPropertyObject(auth, entityTypeId, lead);

        await this.getBudget(auth, entityTypeId, lead);

        if (!lead.importMetadaten.betreuung) {
            lead.importMetadaten.betreuung = {};
        }
        lead.importMetadaten.betreuung.bearbeiter = editorPartnerId;
        lead.importMetadaten.betreuung.kundenbetreuer = ownerPartnerId;
        lead.updateMetadaten = {
            tippgeber: lead.importMetadaten.tippgeber,
            betreuung: lead.importMetadaten.betreuung,
        };

        for (const customer of customers) {
            const applicant = applicants?.length ? applicants[0] : null;
            if (applicant) {
                applicant.referenzId = String(customer.CUSTOMER)
            }
            const passport = passportDatas?.length ? passportDatas[0] : null;

            const kunden = { ...customer, ...applicant };

            if (!kunden.personendaten.familienstand?.['@type']?.length) {
                kunden.personendaten.familienstand = null;
            }

            if (!kunden.personendaten.nichtEuBuerger.aufenthaltstitel.arbeitserlaubnis?.['@type']?.length) {
                kunden.personendaten.nichtEuBuerger.aufenthaltstitel.arbeitserlaubnis['@type'] = 'ARBEITSERLAUBNIS_VORHANDEN';
            }

            lead.importMetadaten.importquelle = kunden.importquelle;

            if (!kunden.zusatzangaben) {
                kunden.zusatzangaben = {
                    legitimationsdaten: passport,
                };

                if (kunden.zusatzangaben.legitimationsdaten && !kunden.zusatzangaben.legitimationsdaten.ausweisart?.['@type']?.length) {
                    kunden.zusatzangaben.legitimationsdaten.ausweisart = null;
                }
            }
            kunden.zusatzangaben.branche = job?.zusatzangaben?.branche;
            kunden.zusatzangaben.zusatzangabenProProduktanbieter = [];

            if (job?.zusatzangabenDsl['@type']?.length) {
                kunden.zusatzangaben.zusatzangabenProProduktanbieter.push(job.zusatzangabenDsl);
            }

            if (job?.zusatzangabenIng['@type']?.length) {
                kunden.zusatzangaben.zusatzangabenProProduktanbieter.push(job.zusatzangabenIng);
            }

            if (job?.zusatzangabenMhb['@type']?.length) {
                kunden.zusatzangaben.zusatzangabenProProduktanbieter.push(job.zusatzangabenMhb);
            }
            kunden.finanzielles = { ...kunden.finanzielles, ...job };

            if (!kunden.finanzielles.beschaeftigung?.['@type']) {
                kunden.finanzielles.beschaeftigung = undefined
            }

            lead.kundenangaben.haushalte[0].kunden.push(kunden);
        }

        if (bankAccount?.length) {
            lead.kundenangaben.bankverbindung = bankAccount[0];
        }

        lead.kundenangaben.haushalte[0].kinder = childs;

        if (!lead.kundenangaben.haushalte[0].zusatzangaben.zusatzangabenProProduktanbieter) {
            lead.kundenangaben.haushalte[0].zusatzangaben.zusatzangabenProProduktanbieter = [];

            if (lead.ZusatzangabenHaushaltIngtype?.length) {
                lead.kundenangaben.haushalte[0].zusatzangaben.zusatzangabenProProduktanbieter.push({
                    '@type': lead.ZusatzangabenHaushaltIngtype,
                    anzahlErwachseneImHaushalt: lead.ZusatzangabenHaushaltInganzahlErwachseneImHaushalt,
                    anzahlKinderNichtImHaushalt: lead.ZusatzangabenHaushaltInganzahlKinderNichtImHaushalt,
                });
            }

            if (lead.ZusatzangabenHaushaltDsltype?.length) {
                lead.kundenangaben.haushalte[0].zusatzangaben.zusatzangabenProProduktanbieter.push({
                    '@type': lead.ZusatzangabenHaushaltDsltype,
                    lebenshaltungskostenMonatlich: lead.ZusatzangabenHaushaltDsllebenshaltungskostenMonatlich,
                });
            }
        }

        writeFileSync(`leads/lead_${lead.LEAD}.json`, JSON.stringify({ ...lead, raws: undefined }));

        const createUpdateResult = !lead.id?.length
            ? await this.europaceService.createCase(auth, tokenData.access_token, lead)
            : await this.europaceService.updateCase(auth, tokenData.access_token, lead);

        if (!createUpdateResult) {
            return;
        }

        const leadData = {
            [MatchingEntityEnum.LEAD]: {
                [spId]: {
                    LastAPIResponseMessage: JSON.stringify(createUpdateResult),
                    LastAPIResponseCode: lead.id?.length ? '204' : '201',
                    id: lead.id || createUpdateResult['vorgangsnummer'],
                    hasUnmatched: false
                },
            },
        };

        if (!lead.raws.importMetadaten?.betreuung?.bearbeiter?.length) {
            const { idField } = await this.helper.getMatch(auth, MatchingEntityEnum.LEAD, 'importMetadaten.betreuung.bearbeiter');
            leadData[MatchingEntityEnum.LEAD][spId][idField] = lead.raws?.['importMetadaten.betreuung.kundenbetreuer']?.[0]?.id;
            leadData[MatchingEntityEnum.LEAD][spId].hasUnmatched = true
        }

        await this.matching.saveData(auth, leadData);

        if (!lead.id?.length)
            return [lead.id || createUpdateResult['vorgangsnummer'], editorTokenData, editorPartnerId];
        
        return [lead.id || createUpdateResult['vorgangsnummer'], tokenData, partnerId];
    }

    /**
     * Get lead from Bitrix24 and fill default fields;
     *
     * @param auth - Bitrix24 auth data.
     * @param spId - lead smart process.
     * @returns
     */
    private async getLeadToSend(auth: Auth, spId: string) {
        const lead = await this.matching.prepareData<IEuropaceLeadMatching>(
            auth,
            MatchingEntityEnum.LEAD,
            { id: spId },
            { [BX_ENTITY.SMART_PROCESS]: ['contactIds', 'assignedById'] },
        );
        if (!lead.LEAD) {
            this.errorHandler.internal({ auth, message: 'Lead not found by id', payload: { spId } });
        }
        //defaults
        lead.kundenangaben.haushalte[0].kunden = [];

        if (lead.importMetadaten?.tippgeber && !lead.importMetadaten?.tippgeber?.tippgeberPartnerId?.length) {
            lead.importMetadaten.tippgeber = undefined;
        }

        if (!lead.importMetadaten.betreuung?.bearbeiter?.length) {
            if (!lead.importMetadaten.betreuung) {
                lead.importMetadaten.betreuung = {};
            }
            lead.importMetadaten.betreuung.bearbeiter = lead.importMetadaten.betreuung?.kundenbetreuer;
        }

        if (!lead.importMetadaten.betreuung?.bearbeiter?.length && !lead.importMetadaten.betreuung?.kundenbetreuer?.length) {
            lead.importMetadaten.betreuung = undefined;
        }

        lead.updateMetadaten = {
            tippgeber: lead.importMetadaten.tippgeber,
            betreuung: lead.importMetadaten.betreuung,
        };

        return lead;
    }

    /**
     * Get property object from Bitrix24 and fill default fields;
     *
     * @param auth - Bitrix24 auth data.
     * @param entityTypeId - lead smart process type id.
     * @param lead - lead data.
     */
    private async getPropertyObject(auth: Auth, entityTypeId: string, lead: IEuropaceLeadMatching) {
        const propertyObjects = await this.matching.prepareListWithLinkedData<IEuropaceObjectMatching>(auth, MatchingEntityEnum.OBJECT, {
            filter: {
                [`parentId${entityTypeId}`]: lead.LEAD,
            },
        });

        const propertyObject = propertyObjects.length ? propertyObjects[0] : null;

        if (propertyObject) {
            lead.kundenangaben.finanzierungsobjekt = { ...lead.kundenangaben.finanzierungsobjekt, ...propertyObject.finanzierungsobjekt };
            lead.kundenangaben.finanzierungsbedarf = { ...lead.kundenangaben.finanzierungsbedarf, ...propertyObject.finanzierungsbedarf };
        }

        if (!lead.kundenangaben.finanzierungsbedarf.finanzierungszweck['@type']?.length) {
            lead.kundenangaben.finanzierungsbedarf.finanzierungszweck = null;
        }

        if (
            !lead.kundenangaben.finanzierungsbedarf.finanzierungsbausteine?.length ||
            !lead.kundenangaben.finanzierungsbedarf.finanzierungsbausteine[0]['@type']?.length
        ) {
            lead.kundenangaben.finanzierungsbedarf.finanzierungsbausteine = [];
        }

        if (!lead.kundenangaben.finanzierungsobjekt.darlehensliste?.length || !lead.kundenangaben.finanzierungsobjekt.darlehensliste[0]['@type']?.length) {
            lead.kundenangaben.finanzierungsobjekt.darlehensliste = [];
        }

        if (lead.kundenangaben.finanzierungsobjekt.immobilie) {
            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.typ['@type']?.length) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.typ = null;
            }

            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung = {};
            }

            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung['@type']) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung['@type'] = 'VORHANDENE_GRUNDBUCHANGABE';
            }

            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung.rechteInAbteilung2) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung.rechteInAbteilung2 = {};
            }

            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung.rechteInAbteilung2['@type']) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.grundbuchangabeErfassung.rechteInAbteilung2['@type'] = 'KEINE_RECHTE_ABTEILUNG_2';
            }

            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.stellplaetzeErfassung) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.stellplaetzeErfassung = {};
            }

            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.stellplaetzeErfassung['@type']) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.stellplaetzeErfassung['@type'] = 'KEINE_STELLPLAETZE';
            }

            if (
               !lead.kundenangaben.finanzierungsobjekt.immobilie.stellplaetze?.length ||
               !lead.kundenangaben.finanzierungsobjekt.immobilie.stellplaetze[0]['@type']?.length
            ) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.stellplaetze = null;
            }

            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude = {};
            }
            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.modernisierungErfassung) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.modernisierungErfassung = {};
            }
            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.modernisierungErfassung['@type']) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.modernisierungErfassung['@type'] = 'VORHANDENE_MODERNISIERUNG';
            }
            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.nutzung) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.nutzung = {};
            }
            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.nutzung.gewerbeErfassung) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.nutzung.gewerbeErfassung = {};
            }
            if (!lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.nutzung.gewerbeErfassung['@type']) {
                lead.kundenangaben.finanzierungsobjekt.immobilie.typ.gebaeude.nutzung.gewerbeErfassung['@type'] = 'KEIN_GEWERBE';
            }

        }
    }

    /**
     * Get existing property object from Bitrix24 and fill default fields;
     *
     * @param auth - Bitrix24 auth data.
     * @param applicantEntityTypeId - applicant smart process type id.
     * @param applicantsIds - array applicant ids.
     * @param lead - lead data.
     */
    private async getExistingProperties(auth: Auth, applicantEntityTypeId: string, applicantsIds: number[], lead: IEuropaceLeadMatching) {
        lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien =
           await this.matching.prepareListWithLinkedData<IEuropaceExistingPropertyMatching>(
              auth,
              MatchingEntityEnum.EXISTING_PROPERTY,
              {
                  filter: {
                      [`parentId${applicantEntityTypeId}`]: applicantsIds,
                  },
              },
           );

        if (
            lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien?.length &&
            !lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien[0].immobilie?.typ['@type']
        ) {
            lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien = [];
        }

        if (lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien[0]) {
            let i = 0;
            while (lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien[i]) {
                if (!lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien[i].immobilie?.typ?.gebaeude?.nutzung?.wohnen?.nutzungsart['@type']) {
                    const newval = {nutzung: {wohnen: {nutzungsart: {'@type': 'EIGENGENUTZT'}}}};
                    lead.kundenangaben.haushalte[0].finanzielleSituation.bestehendeImmobilien[i].immobilie.typ.gebaeude = newval;
                }
                i++;
            }
        }

    }

    /**
     * Get budget from Bitrix24 and fill default fields;
     *
     * @param auth - Bitrix24 auth data.
     * @param entityTypeId - applicant smart process type id.
     * @param lead - lead data.
     */
    private async getBudget(auth: Auth, entityTypeId: string, lead: IEuropaceLeadMatching) {
        const arrBudget = await this.matching.prepareListWithLinkedData<IEuropaceMonthlyBudgetMatching>(auth, MatchingEntityEnum.MONTHLY_BUDGET, {
            filter: {
                [`parentId${entityTypeId}`]: lead.LEAD,
            },
        });

        const budget = arrBudget?.length ? arrBudget[0] : null;
        if (budget) {
            // temporary!
            budget['vermoegen'] = undefined;
            budget['zusatzangaben'] = undefined;
            budget['zusatzangabenProProduktanbieter'] = undefined;
        }

        if (budget) {
            lead.kundenangaben.haushalte[0].finanzielleSituation = { ...lead.kundenangaben.haushalte[0].finanzielleSituation, ...budget };
        }
    }

    /**
     * Gets Eoropace API access token for user by Bitrix24 access token.
     * @param auth - authentication data.
     * @param access_token - Bitrix24 access token.
     * @returns string - Europace API access token.
     * @see Auth
     * @see BxApiService
     * @private
     */
    private async getEditorToken(auth: Auth, access_token: string) {
        const requestAuth = JSON.parse(JSON.stringify(auth));
        requestAuth.auth_token = access_token;
        const user = await this.bx.callBXApi<{ID: number}>(requestAuth, { method: 'user.current', data: {} });
        return await this.helper.getEuropaceToken(auth, user.data.ID, true);
    }
}
