import { Injectable } from '@nestjs/common';
import MatchingService from '../matching/matching.service';
import MatchingEntityEnum from '../../common/enums/matching.entity.enum';
import EuropaceService from '../europace/europace.service';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';
import { IEuropaceLeadMatching } from '../europace/models/interfaces/matching/europace.lead.matching';
import CreateOrUpdateCaseTask from '../task/tasks/createOrUpdateCase.task';

/**
 * Service processing of obtaining a link to a personal
 * account in Europace based on data taken from SP.
 *
 * Uses:
 * @see ErrorHandler
 * @see MatchingService
 * @see EuropaceService
 */
@Injectable()
export class EuropaceAuthService {
    constructor(
        private readonly matching: MatchingService,
        private readonly europaceService: EuropaceService,
        private readonly errorHandler: ErrorHandler,
        private readonly createOrUpdateCaseTask: CreateOrUpdateCaseTask,
    ) {}

    /**
     * Updates or creates lead with Europace API and then
     * generates URL for silent sign in Europace web interface.
     * @param auth - authentication data.
     * @param typeId - Bitrix24 smart process type identifier.
     * @param entityId - Bitrix24 smart process identifier.
     * @param userAuth - requesting Bitrix24 user's access token.
     * @returns string - URL for sign in.
     * @throws NotFoundException if smart process entity, Europace lead or credentials not found.
     * @throws InternalServerErrorException if sign in failed.
     * @see Auth
     * @see MatchingService
     * @see CreateOrUpdateCaseTask
     * @see EuropaceAuthService.getToken
     * @see EuropaceService.silentSignIn
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async getUrl(auth: Auth, typeId: number, entityId: number, userAuth:string): Promise<string> {
        if (!typeId || !entityId) this.errorHandler.notFound(auth, 'Wrong entityTypeId or typeId', 'wrong.entityId.or.entityTypeId.notFound');

        const lead = await this.matching.prepareData<IEuropaceLeadMatching>(auth, MatchingEntityEnum.LEAD, { id: entityId });
        if (!lead) {
            this.errorHandler.notFound(auth, `Lead not found`, 'field.Lead.notFound');
        }

        const [leadId, tokenData, partnerId] = await this.createOrUpdateCaseTask.process(auth, `${entityId}`, `${typeId}`, userAuth, true);

        if (!leadId?.length) this.errorHandler.notFound(auth, `EuropaceId not found in this entity`, 'field.EuropaceId.notFound');

        try {
            return await this.europaceService.silentSignIn(auth, tokenData.access_token, partnerId, leadId);
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to get auth url to redirect', e });
        }
    }
}
