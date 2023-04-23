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
import { IEuropaceBankAccount } from '../../europace/models/interfaces/europace.bankAccount';
import IBxApiCall from '../../../modules/bxapi/models/intefaces/bx.api.call';
import { IEuropaceExistingProperty } from '../../europace/models/interfaces/europace..existingProperty.response';
import { IEuropaceCustomer } from '../../europace/models/interfaces/europace.customer';
import { BxApiService } from '../../bxapi/bx.api.service';
import { IEuropaceChildren } from '../../europace/models/interfaces/europace.children';

@Injectable()
export default class GetCaseTask {
    private readonly logger = new Logger(GetCaseTask.name);

    constructor(
        private readonly matching: MatchingService,
        private readonly helper: TaskHelper,
        private readonly europaceService: EuropaceService,
        private readonly errorHandler: ErrorHandler,
        private readonly bx: BxApiService,
    ) {}

    /**
     * Sync data from Europace API to Bitrix24 by specified smart process element ID.
     * @param auth - authentication data.
     * @param spId - Bitrix24 smart process element identifier.
     * @param entityTypeId - Bitrix24 smart process type identifier.
     * @throws NotFoundException  if sP not found.
     * @see MatchingService
     * @see EuropaceService
     * @see BxApiService
     */
    async process(auth: Auth, spId: string, entityTypeId: string) {
        if (!spId?.length || !entityTypeId?.length) return;

        const lead = await this.matching.prepareData<IEuropaceLeadMatching>(
            auth,
            MatchingEntityEnum.LEAD,
            { id: spId },
            { [BX_ENTITY.SMART_PROCESS]: ['contactId', 'assignedById'] },
        );
        if (!lead.LEAD) {
            this.errorHandler.internal({ auth, message: 'Lead not found by id', payload: { spId } });
        }

        const [tokenData] = await this.helper.getEuropaceToken(auth, lead.assignedById);
        const caseData = await this.europaceService.getCase(auth, tokenData.access_token, lead.id);

        if (caseData.haushalte?.length) {
            await this.saveCustomer(auth, lead, entityTypeId, caseData.haushalte[0].kunden);

            await this.saveChildren(auth, lead, entityTypeId, caseData.haushalte[0].kinderErfassung.kinder);

            await this.savePropertyObject(auth, lead, entityTypeId, {
                finanzierungsobjekt: caseData.finanzierungsobjekt,
                finanzierungsbedarf: caseData.finanzierungsbedarf,
            });

            await this.saveApplicant(auth, lead, entityTypeId, caseData.haushalte[0].kunden);

            await this.saveAdditionalApplicantData(
                auth,
                lead,
                entityTypeId,
                caseData.haushalte[0].kunden,
                caseData.haushalte[0].finanzielleSituation?.bestehendeImmobilienErfassung?.bestehendeImmobilien,
            );

            await this.saveMonthlyBudget(auth, lead, entityTypeId, caseData.haushalte[0].finanzielleSituation);
        }

        await this.saveBankAccount(auth, lead, entityTypeId, caseData.bankverbindung);

        const matchLead = { kundenangaben: caseData, LastAPIResponseMessage: JSON.stringify(caseData), LastAPIResponseCode: '201' };

        const leadData = {
            [MatchingEntityEnum.LEAD]: {
                0: [],
            },
        };
        leadData[MatchingEntityEnum.LEAD][spId] = matchLead;

        await this.matching.saveData(auth, leadData);
    }

    /**
     * Saves customer data in Bitrix.
     *
     * @param auth - authentication data.
     * @param lead - parent lead.
     * @param leadEntityTypeId - parent lead entity type id.
     * @param customers - customers array.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveCustomer(auth: Auth, lead: IEuropaceLeadMatching, leadEntityTypeId: string, customers: IEuropaceCustomer[]) {
        if (!customers?.length) return;

        const ids = customers.map((x) => x.externeKundenId);

        const { idField: idCustomerField, entityTypeId: customerEntityTypeId } = await this.helper.getMatch<IEuropaceCustomerMatching>(
            auth,
            MatchingEntityEnum.CUSTOMER,
            'externeKundenId',
        );
        const bxCustomers = await this.bx.getCRMMap(auth, 'contact', idCustomerField, Array.from(ids), customerEntityTypeId);

        const data = {
            [MatchingEntityEnum.CUSTOMER]: {
                0: [],
            },
        };

        for (const item of customers) {
            const matchCustomer: IEuropaceCustomerMatching = { ...item };
            matchCustomer[`parentId${leadEntityTypeId}`] = lead.LEAD;

            MatchingService.pushDataToDataset<IEuropaceCustomerMatching>(
                data,
                MatchingEntityEnum.CUSTOMER,
                matchCustomer,
                bxCustomers,
                String(matchCustomer.externeKundenId),
                'ID',
            );
        }

        if (!data[MatchingEntityEnum.CUSTOMER][0].length) {
            delete data[MatchingEntityEnum.CUSTOMER][0];
        }

        if (Object.keys(data[MatchingEntityEnum.CUSTOMER]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves child data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param lead - parent lead.
     * @param leadEntityTypeId - parent lead entity type id.
     * @param children - child array.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveChildren(auth: Auth, lead: IEuropaceLeadMatching, leadEntityTypeId: string, children: IEuropaceChildren[]) {
        if (!children?.length) return;

        const ids = children.map((x) => x.kundenreferenzIdRiesterzuordnung);

        const { idField: idChildField, entityTypeId: childEntityTypeId } = await this.helper.getMatch<IEuropaceChildrenMatching>(
            auth,
            MatchingEntityEnum.CHILDREN,
            'kundenreferenzIdRiesterzuordnung',
        );

        const bxChilds = await this.bx.getCRMMap(auth, 'item', idChildField, Array.from(ids), childEntityTypeId);

        const data = {
            [MatchingEntityEnum.CHILDREN]: {
                0: [],
            },
        };

        for (const child of children) {
            const matchChild: IEuropaceChildrenMatching = { ...child };
            matchChild[`parentId${leadEntityTypeId}`] = lead.LEAD;
            matchChild.assignedById = lead.assignedById;
            matchChild.hasUnmatched = true;

            MatchingService.pushDataToDataset<IEuropaceChildrenMatching>(
                data,
                MatchingEntityEnum.CHILDREN,
                matchChild,
                bxChilds,
                String(matchChild.kundenreferenzIdRiesterzuordnung),
                'id',
            );
        }

        if (!data[MatchingEntityEnum.CHILDREN][0].length) {
            delete data[MatchingEntityEnum.CHILDREN][0];
        }

        if (Object.keys(data[MatchingEntityEnum.CHILDREN]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves applicant data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param lead - parent lead.
     * @param leadEntityTypeId - parent lead entity type id.
     * @param applicants - applicants array.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveApplicant(auth: Auth, lead: IEuropaceLeadMatching, leadEntityTypeId: string, applicants: IEuropaceApplicantMatching[]) {
        const ids = applicants.map((x) => x.externeKundenId);

        const { idField: idField, entityTypeId: applicantEntityTypeId } = await this.helper.getMatch<IEuropaceApplicantMatching>(
            auth,
            MatchingEntityEnum.APPLICANT,
            'externeKundenId',
        );
        const bxItems = await this.bx.getCRMMap(auth, 'item', idField, Array.from(ids), applicantEntityTypeId);

        const data = {
            [MatchingEntityEnum.APPLICANT]: {
                0: [],
            },
        };

        for (const item of applicants) {
            const matchItem: IEuropaceApplicantMatching = { ...item };
            matchItem[`parentId${leadEntityTypeId}`] = lead.LEAD;
            matchItem.hasUnmatched = true;

            MatchingService.pushDataToDataset<IEuropaceApplicantMatching>(
                data,
                MatchingEntityEnum.APPLICANT,
                matchItem,
                bxItems,
                String(matchItem.externeKundenId),
                'id',
            );
        }

        if (!data[MatchingEntityEnum.APPLICANT][0].length) {
            delete data[MatchingEntityEnum.APPLICANT][0];
        }

        if (Object.keys(data[MatchingEntityEnum.APPLICANT]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves additional applicant data in Bitrix smart process.
     * - job
     * - passport
     * - existing property
     *
     * @param auth - authentication data.
     * @param lead - parent lead.
     * @param leadEntityTypeId - parent lead entity type id.
     * @param customers - customer array.
     * @param existingProperties - existing properties array.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveAdditionalApplicantData(
        auth: Auth,
        lead: IEuropaceLeadMatching,
        leadEntityTypeId: string,
        customers: IEuropaceCustomer[],
        existingProperties: IEuropaceExistingProperty[],
    ) {
        const ids = customers.map((x) => x.externeKundenId);

        const { idField: applicantIdField, entityTypeId: applicantEntityTypeId } = await this.helper.getMatch<IEuropaceApplicantMatching>(
            auth,
            MatchingEntityEnum.APPLICANT,
            'externeKundenId',
        );
        const bxApplicants = await this.bx.getCRMMap(auth, 'item', applicantIdField, Array.from(ids), [applicantIdField], applicantEntityTypeId);

        if (Object.keys(bxApplicants).length < 1) return;

        //only for the first customer?
        let existingPropertySaved = false;

        for (const applicantKey of Object.keys(bxApplicants)) {
            const applicant = bxApplicants[applicantKey];
            const customer = customers.find((x) => x.externeKundenId === applicant[applicantIdField]);
            if (!customer) continue;

            await this.saveJob(auth, applicantEntityTypeId, customer, applicant);

            await this.savePassport(auth, applicantEntityTypeId, customer, applicant);

            if (existingProperties?.length && !existingPropertySaved) {
                existingPropertySaved = true;
                await this.saveExistingProperty(auth, applicantEntityTypeId, existingProperties, applicant);
            }
        }
    }

    /**
     * Saves job data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param applicantEntityTypeId - parent applicant entity type id.
     * @param customer - customer data.
     * @param applicant - applicant data.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveJob(auth: Auth, applicantEntityTypeId: string, customer: IEuropaceCustomer, applicant: { id: number }) {
        const jobs = await this.matching.prepareList<IEuropaceJobMatching>(auth, MatchingEntityEnum.JOB, {
            filter: {
                [`parentId${applicantEntityTypeId}`]: applicant.id,
            },
        });
        const job = jobs?.length ? jobs[0] : null;

        const data = {
            [MatchingEntityEnum.JOB]: {
                0: [],
            },
        };

        const matchJob: IEuropaceJobMatching = { ...customer.finanzielles };
        matchJob[`parentId${applicantEntityTypeId}`] = applicant.id;
        matchJob.hasUnmatched = true;

        if (job) {
            data[MatchingEntityEnum.JOB][job.JOB] = matchJob;
        } else {
            data[MatchingEntityEnum.JOB][0].push(matchJob);
        }

        if (!data[MatchingEntityEnum.JOB][0].length) {
            delete data[MatchingEntityEnum.JOB][0];
        }

        if (Object.keys(data[MatchingEntityEnum.JOB]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves passport data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param applicantEntityTypeId - parent applicant entity type id.
     * @param customer - customer data.
     * @param applicant - applicant data.
     * @see Auth
     * @see MatchingInterface
     */
    private async savePassport(auth: Auth, applicantEntityTypeId: string, customer: IEuropaceCustomer, applicant: { id: number }) {
        const jobs = await this.matching.prepareList<IEuropacePassportMatching>(auth, MatchingEntityEnum.PASSPORT, {
            filter: {
                [`parentId${applicantEntityTypeId}`]: applicant.id,
            },
        });
        const job = jobs?.length ? jobs[0] : null;

        const data = {
            [MatchingEntityEnum.PASSPORT]: {
                0: [],
            },
        };

        if (!customer.zusatzangaben?.legitimationsdaten) {
            return;
        }

        const matchPassport: IEuropacePassportMatching = { ...customer.zusatzangaben.legitimationsdaten };
        matchPassport[`parentId${applicantEntityTypeId}`] = applicant.id;
        matchPassport.hasUnmatched = true;

        if (job) {
            data[MatchingEntityEnum.PASSPORT][job.PASSPORT] = matchPassport;
        } else {
            data[MatchingEntityEnum.PASSPORT][0].push(matchPassport);
        }

        if (!data[MatchingEntityEnum.PASSPORT][0].length) {
            delete data[MatchingEntityEnum.PASSPORT][0];
        }

        if (Object.keys(data[MatchingEntityEnum.PASSPORT]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves monthly budget data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param lead - parent lead.
     * @param leadEntityTypeId - parent lead entity type id.
     * @param budget - budget data.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveMonthlyBudget(auth: Auth, lead: IEuropaceLeadMatching, leadEntityTypeId: string, budget: IEuropaceMonthlyBudgetMatching) {
        const arrBudget = await this.matching.prepareList<IEuropaceMonthlyBudgetMatching>(auth, MatchingEntityEnum.MONTHLY_BUDGET, {
            filter: {
                [`parentId${leadEntityTypeId}`]: lead.LEAD,
            },
        });

        const existsBudget = arrBudget?.length ? arrBudget[0] : null;
        const data = {
            [MatchingEntityEnum.MONTHLY_BUDGET]: {
                0: [],
            },
        };

        const matchBankAccount: IEuropaceMonthlyBudgetMatching = { ...budget };
        matchBankAccount[`parentId${leadEntityTypeId}`] = lead.LEAD;
        matchBankAccount.hasUnmatched = true;

        if (existsBudget) {
            data[MatchingEntityEnum.MONTHLY_BUDGET][existsBudget.MONTHLY_BUDGET] = matchBankAccount;
        } else {
            data[MatchingEntityEnum.MONTHLY_BUDGET][0].push(matchBankAccount);
        }

        if (!data[MatchingEntityEnum.MONTHLY_BUDGET][0].length) {
            delete data[MatchingEntityEnum.MONTHLY_BUDGET][0];
        }

        if (Object.keys(data[MatchingEntityEnum.MONTHLY_BUDGET]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves property object data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param lead - parent lead.
     * @param leadEntityTypeId - parent lead entity type id.
     * @param propertyObject - propertyObject data.
     * @see Auth
     * @see MatchingInterface
     */
    private async savePropertyObject(auth: Auth, lead: IEuropaceLeadMatching, leadEntityTypeId: string, propertyObject: IEuropaceObjectMatching) {
        const propertyObjects = await this.matching.prepareList<IEuropaceObjectMatching>(auth, MatchingEntityEnum.OBJECT, {
            filter: {
                [`parentId${leadEntityTypeId}`]: lead.LEAD,
            },
        });

        const existsItem = propertyObjects?.length ? propertyObjects[0] : null;
        const data = {
            [MatchingEntityEnum.OBJECT]: {
                0: [],
            },
        };

        const matchEntity: IEuropaceObjectMatching = { ...propertyObject };
        matchEntity[`parentId${leadEntityTypeId}`] = lead.LEAD;
        matchEntity.hasUnmatched = true;

        if (existsItem) {
            data[MatchingEntityEnum.OBJECT][existsItem.OBJECT] = matchEntity;
        } else {
            data[MatchingEntityEnum.OBJECT][0].push(matchEntity);
        }

        if (!data[MatchingEntityEnum.OBJECT][0].length) {
            delete data[MatchingEntityEnum.OBJECT][0];
        }

        if (Object.keys(data[MatchingEntityEnum.OBJECT]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves exsiting property objects data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param applicantEntityTypeId - parent applicant entity type id.
     * @param existingProperties - existing property data.
     * @param applicant - applicant data.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveExistingProperty(auth: Auth, applicantEntityTypeId: string, existingProperties: IEuropaceExistingProperty[], applicant: { id: number }) {
        const propertyObjects = await this.matching.prepareList<IEuropaceExistingPropertyMatching>(auth, MatchingEntityEnum.EXISTING_PROPERTY, {
            filter: {
                [`parentId${applicantEntityTypeId}`]: applicant.id,
            },
        });

        const { entityTypeId: existingPropertyEntityTypeId } = await this.helper.getMatch<IEuropaceExistingPropertyMatching>(
            auth,
            MatchingEntityEnum.EXISTING_PROPERTY,
            'marktwert',
        );

        if (propertyObjects.length) {
            const delBatch: IBxApiCall[] = propertyObjects.map((x) => {
                return {
                    id: `del_${x.EXISTING_PROPERTY}`,
                    method: 'crm.item.delete',
                    data: { entityTypeId: existingPropertyEntityTypeId, id: x.EXISTING_PROPERTY },
                };
            });
            await this.bx.callBXBatch(auth, delBatch);
        }

        const data = {
            [MatchingEntityEnum.EXISTING_PROPERTY]: {
                0: [],
            },
        };

        for (const item of existingProperties) {
            const matchItem: IEuropaceExistingPropertyMatching = { ...item };
            matchItem[`parentId${applicantEntityTypeId}`] = applicant.id;
            matchItem.hasUnmatched = true;
            data[MatchingEntityEnum.EXISTING_PROPERTY][0].push(matchItem);
        }

        if (!data[MatchingEntityEnum.EXISTING_PROPERTY][0].length) {
            delete data[MatchingEntityEnum.EXISTING_PROPERTY][0];
        }

        if (Object.keys(data[MatchingEntityEnum.EXISTING_PROPERTY]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }

    /**
     * Saves bank account data in Bitrix smart process.
     *
     * @param auth - authentication data.
     * @param lead - parent lead.
     * @param leadEntityTypeId - parent lead entity type id.
     * @param bankAccount - bank account.
     * @see Auth
     * @see MatchingInterface
     */
    private async saveBankAccount(auth: Auth, lead: IEuropaceLeadMatching, leadEntityTypeId: string, bankAccount: IEuropaceBankAccount) {
        const bankAccounts = await this.matching.prepareList<IEuropaceBankAccountMatching>(auth, MatchingEntityEnum.BANK_ACCOUNT, {
            filter: {
                [`parentId${leadEntityTypeId}`]: lead.LEAD,
            },
        });

        const existsBankAccount = bankAccounts?.length ? bankAccounts[0] : null;
        const data = {
            [MatchingEntityEnum.BANK_ACCOUNT]: {
                0: [],
            },
        };

        const matchBankAccount: IEuropaceBankAccountMatching = { ...bankAccount };
        matchBankAccount[`parentId${leadEntityTypeId}`] = lead.LEAD;
        matchBankAccount.assignedById = lead.assignedById;
        matchBankAccount.hasUnmatched = true;

        if (existsBankAccount) {
            data[MatchingEntityEnum.BANK_ACCOUNT][existsBankAccount.BANK_ACCOUNT] = matchBankAccount;
        } else {
            data[MatchingEntityEnum.BANK_ACCOUNT][0].push(matchBankAccount);
        }

        if (!data[MatchingEntityEnum.BANK_ACCOUNT][0].length) {
            delete data[MatchingEntityEnum.BANK_ACCOUNT][0];
        }

        if (Object.keys(data[MatchingEntityEnum.BANK_ACCOUNT]).length > 0) {
            await this.matching.saveData(auth, data);
        }
    }
}
