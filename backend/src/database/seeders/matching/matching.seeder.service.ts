import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ApiField from '../../../modules/matching/models/entities/api.field.entity';
import { Repository } from 'typeorm';
import DefaultMatching from '../../../modules/matching/models/entities/default.matching';
import CREDENTIALS_FIELDS from './data/credentials.fields';
import OBJECT_FIELDS from './data/object.fields';
import CHILDREN_FIELDS from './data/children.fields';
import MONTHLY_BUDGET_FIELDS from './data/monthlyBudget';
import JOB_FIELDS from './data/job.fields';
import PASSPORT_FIELDS from './data/passport.fields';
import CUSTOMER_FIELDS from './data/customer.fields';
import LEAD_FIELDS from './data/lead.fields';
import APPLICANT_FIELDS from './data/applicant.fields';
import BANK_ACCOUNT_FIELDS from './data/bankAccount.fields';
import EXISTING_PROPERTY_FIELDS from './data/existingProperty.fields';
import APPLICATION_FIELDS from './data/application.fields';
import DOCUMENT_FIELDS from './data/document.fields';

/**
 * Seeds entities fields descriptions and default matching.
 * @see MatchingService
 * @see ApiField
 * @see DefaultMatching
 */
@Injectable()
export default class MatchingSeederService {
    constructor(
        @InjectRepository(ApiField) private readonly fieldRepo: Repository<ApiField>,
        @InjectRepository(DefaultMatching) private readonly defaultRepo: Repository<DefaultMatching>,
    ) {}

    /**
     * Main seeding handler
     */
    async seed() {
        await this.credentialsFields();
        await this.customerFields();
        await this.objectFields();
        await this.existingPropertyFields();
        await this.childrenFields();
        await this.monthlyBudgetFields();
        await this.jobFields();
        await this.passportFields();
        await this.leadFields();
        await this.applicantFields();
        await this.bankAccount();
        await this.applicationFields();
        await this.documentFields();
    }

    /**
     * Clear all matching handler
     */
    async clear() {
        await this.clearFieldRepo();
        await this.clearDefaultRepo();
    }

    /**
     * Seeds credentials fields
     * @see CUSTOMER_FIELDS
     * @see MatchingEntityEnum.CREDENTIALS
     * @see ApiField
     * @private
     */
    private async credentialsFields() {
        try {
            await this.fieldRepo.save(CREDENTIALS_FIELDS);
        } catch (e) {
            console.error('Failed to seed credentials fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds customer fields
     * @see CUSTOMER_FIELDS
     * @see MatchingEntityEnum.CUSTOMER
     * @see ApiField
     * @private
     */
    private async customerFields() {
        try {
            await this.fieldRepo.save(CUSTOMER_FIELDS);
        } catch (e) {
            console.error('Failed to seed customer fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds job fields
     * @see JOB_FIELDS
     * @see MatchingEntityEnum.JOB
     * @see ApiField
     * @private
     */
    private async jobFields() {
        try {
            await this.fieldRepo.save(JOB_FIELDS);
        } catch (e) {
            console.error('Failed to seed job fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds passport fields
     * @see PASSPORT_FIELDS
     * @see MatchingEntityEnum.CREDENTIALS
     * @see ApiField
     * @private
     */
    private async passportFields() {
        try {
            await this.fieldRepo.save(PASSPORT_FIELDS);
        } catch (e) {
            console.error('Failed to seed passport fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds monthly budget fields
     * @see MONTHLY_BUDGET_FIELDS
     * @see MatchingEntityEnum.MONTHLY_BUDGET
     * @see ApiField
     * @private
     */
    private async monthlyBudgetFields() {
        try {
            await this.fieldRepo.save(MONTHLY_BUDGET_FIELDS);
        } catch (e) {
            console.error('Failed to seed monthly budget fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds children fields
     * @see CHILDREN_FIELDS
     * @see MatchingEntityEnum.CHILDREN
     * @see ApiField
     * @private
     */
    private async childrenFields() {
        try {
            await this.fieldRepo.save(CHILDREN_FIELDS);
        } catch (e) {
            console.error('Failed to seed children fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds object fields
     * @see OBJECT_FIELDS
     * @see MatchingEntityEnum.OBJECT
     * @see ApiField
     * @private
     */
    private async objectFields() {
        try {
            await this.fieldRepo.save(OBJECT_FIELDS);
        } catch (e) {
            console.error('Failed to seed object fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds object fields
     * @see EXISTING_PROPERTY_FIELDS
     * @see MatchingEntityEnum.EXISTING_PROPERTY
     * @see ApiField
     * @private
     */
    private async existingPropertyFields() {
        try {
            await this.fieldRepo.save(EXISTING_PROPERTY_FIELDS);
        } catch (e) {
            console.error('Failed to seed existing property object fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds lead fields
     * @see LEAD_FIELDS
     * @see MatchingEntityEnum.LEAD
     * @see ApiField
     * @private
     */
    private async leadFields() {
        try {
            await this.fieldRepo.save(LEAD_FIELDS);
        } catch (e) {
            console.error('Failed to seed lead fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds applicant fields
     * @see APPLICANT_FIELDS
     * @see MatchingEntityEnum.APPLICANT
     * @see ApiField
     * @private
     */
    private async applicantFields() {
        try {
            await this.fieldRepo.save(APPLICANT_FIELDS);
        } catch (e) {
            console.error('Failed to seed applicant fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds applicant fields
     * @see BANK_ACCOUNT_FIELDS
     * @see MatchingEntityEnum.BANK_ACCOUNT
     * @see ApiField
     * @private
     */
    private async bankAccount() {
        try {
            await this.fieldRepo.save(BANK_ACCOUNT_FIELDS);
        } catch (e) {
            console.error('Failed to seed bank account fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds application fields
     * @see APPLICATION_FIELDS
     * @see MatchingEntityEnum.APPLICATION
     * @see ApiField
     * @private
     */
     private async applicationFields() {
        try {
            await this.fieldRepo.save(APPLICATION_FIELDS);
        } catch (e) {
            console.error('Failed to seed application fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Seeds application fields
     * @see DOCUMENT_FIELDS
     * @see MatchingEntityEnum.DOCUMENT
     * @see ApiField
     * @private
     */
     private async documentFields() {
        try {
            await this.fieldRepo.save(DOCUMENT_FIELDS);
        } catch (e) {
            console.error('Failed to seed document fields, they might be already seeded');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Clears all fields
     * @see ApiField
     * @private
     */
    private async clearFieldRepo() {
        try {
            const entities = await this.fieldRepo.find();
            if (entities.length) {
                await this.fieldRepo.remove(entities);
            }
        } catch (e) {
            console.error('Failed to clear fields');
            console.error(e.message);
            console.error(e.stack);
        }
    }

    /**
     * Clears default matching.
     * @see DefaultMatching
     * @private
     */
    private async clearDefaultRepo() {
        try {
            const entities = await this.defaultRepo.find();
            if (entities.length) {
                await this.defaultRepo.remove(entities);
            }
        } catch (e) {
            console.error('Failed to clear defaults');
            console.error(e.message);
            console.error(e.stack);
        }
    }
}
