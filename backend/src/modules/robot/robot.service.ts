import { Injectable, Logger } from '@nestjs/common';
import REGISTERED_ROBOTS from './models/constants/robots';
import { BxApiService } from '../bxapi/bx.api.service';
import IBxRobotData from './models/interfaces/bx.robot.data';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import EuropaceService from '../europace/europace.service';
import RobotException from './models/exceptions/robot.exception';
import MatchingEntityEnum from '../../common/enums/matching.entity.enum';
import MatchingService from '../matching/matching.service';
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';
import TaskHelper from '../task/utils/task.helper';
import { IApiResponseFields } from '../matching/models/interfaces/api.response.fields';
import CreateOrUpdateCaseTask from '../task/tasks/createOrUpdateCase.task';
import GetCaseTask from '../task/tasks/getCase.task';

/**
 * Robots endpoints handler.
 * Checks robot data and calls processor.
 * Handles know robot errors.
 *
 * Usees:
 * - Bitrix api
 * - Europace api
 * - Task service
 * - Matching service
 */
@Injectable()
export default class RobotService {
    private readonly logger = new Logger(RobotService.name);

    constructor(
        private readonly bx: BxApiService,
        private readonly europaceService: EuropaceService,
        private readonly matching: MatchingService,
        private readonly helper: TaskHelper,
        private readonly errorHandler: ErrorHandler,
        private readonly createOrUpdateTask: CreateOrUpdateCaseTask,
        private readonly getCaseTask: GetCaseTask,
    ) {}

    /**
     * Robot handler for tests.
     * Writes robot data to debug log.
     * @param data - robot data.
     */
    async test(data: IBxRobotData): Promise<void> {
        this.checkRobot(data, REGISTERED_ROBOTS.TEST);
    }

    /**
     *
     * Also saves known error to Bitrix24 SP's timeline.
     * @param auth - authentication data.
     * @param data - robot data.
     * @throws BadRequestException if robot data doesn't contain SP id.
     * @throws InternalServerErrorException if Bitrix24 SP not found.
     * @see Auth
     * @see OrdersTask
     * @see saveError
     * @see MatchingInterface
     * @see handleError
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async createOrUpdateCase(auth: Auth, data: IBxRobotData): Promise<void> {
        this.checkRobot(data, REGISTERED_ROBOTS.CASE_PUT);

        const { spId, entityTypeId } = this.getSmartProcessData(auth, data);

        try {
            await this.createOrUpdateTask.process(auth, spId, entityTypeId, data.auth?.access_token);
        } catch (e) {
            await this.handleError(auth, e, spId, data);
        }
    }

    /**
     *
     * Also saves known error to Bitrix24 SP's timeline.
     * @param auth - authentication data.
     * @param data - robot data.
     * @throws BadRequestException if robot data doesn't contain SP id.
     * @throws InternalServerErrorException if Bitrix24 SP or contact not found.
     * @see Auth
     * @see ConfirmationsTask
     * @see saveError
     * @see MatchingInterface
     * @see handleError
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     */
    async getCase(auth: Auth, data: IBxRobotData): Promise<void> {
        this.checkRobot(data, REGISTERED_ROBOTS.CASE_GET);

        const { spId, entityTypeId } = this.getSmartProcessData(auth, data);
        try {
            await this.getCaseTask.process(auth, spId, entityTypeId);
        } catch (e) {
            await this.handleError(auth, e, spId, data);
        }
    }

    /**
     * Checks required data.
     * If some `fields` empty, saves error message to Bitrix24 entity.
     * WARNING: 0 and empty strings considered as missing values.
     * @param auth - authentication data.
     * @param entity - matching entity.
     * @param item - data item.
     * @param fields - required fields.
     * @returns boolean - whether some `fields` empty.
     * @see Auth
     * @see MatchingService
     * @see saveError
     * @private
     */
    private async requiredFieldsMissing<T extends IApiResponseFields>(
        auth: Auth,
        entity: MatchingEntityEnum,
        item: T,
        ...fields: (keyof T)[]
    ): Promise<boolean> {
        const missed = fields.filter((f) => !item[f]);
        if (missed.length > 0) {
            await this.helper.saveError(auth, entity, item[entity], `Required data empty: ${missed.join(', ')}`, 400);
        }
        return missed.length > 0;
    }

    /**
     * Checks whether code of robot is expected for the handler.
     * Logs robot data.
     * @param data - robot data.
     * @param expectedCode - expected robot code.
     * @throws BadRequestException if code is unexpected.
     * @see REGISTERED_ROBOTS
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private checkRobot(data: IBxRobotData, expectedCode: string): void {
        if (expectedCode !== data.code) {
            this.errorHandler.badRequest(data.auth, `Unexpected robot: [${expectedCode}] expected, but got [${data.code}]`);
        }
        this.logger.debug({
            domain: data.auth.domain,
            member_id: data.auth.member_id,
            message: `[${data.code}] robot data`,
            payload: data,
        });
    }

    /**
     * Handles errors occurred during processing.
     * If know robot error thrown, adds a comment to Bitrix24 entity timeline.
     * @param auth - authentication data.
     * @param e - error.
     * @param entityId - processing Bitrix24 entity id.
     * @param data - robot data.
     * @throws InternalServerErrorException if unknown error occurred.
     * @see Auth
     * @see RobotException
     * @see BxApiService
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private async handleError(auth: Auth, e, entityId: string, data: IBxRobotData): Promise<void> {
        const leadData = {
            [MatchingEntityEnum.LEAD]: {
                0: [],
                [entityId]: {
                    LastAPIResponseMessage: e.message,
                    LastAPIResponseCode: '400',
                },
            },
        };

        await this.matching.saveData(auth, leadData);

        this.errorHandler.internal({ auth, message: `[${data.code}] failed`, e });
    }

    /**
     * Gets Bitrix24 crm contact id from robot data by regex.
     * @param auth - authentication data.
     * @param data - robot data.
     * @throws BadRequestException if failed to get contact id.
     * @see Auth
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private getContactId(auth: Auth, data: IBxRobotData): string {
        const contactId = data.document_id[2]?.match(/CONTACT_(\d+)/)?.[1];
        if (!contactId) {
            this.errorHandler.badRequest(auth, auth.member_id, `Contact ID expected but got: [${data.document_id}]`);
        }
        return contactId;
    }

    /**
     * Gets Bitrix24 crm smart process (SP) id and EntityTypeId from robot data by regex.
     * @param auth - authentication data.
     * @param data - robot data.
     * @throws BadRequestException if failed to get SP id.
     * @see Auth
     * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
     * @private
     */
    private getSmartProcessData(auth: Auth, data: IBxRobotData): { spId: string; entityTypeId: string } {
        const values = data.document_id?.[2]?.match(/DYNAMIC_(\d+)_(\d+)/);
        const entityTypeId = values?.[1];
        const spId = values?.[2];
        if (!spId) {
            this.errorHandler.badRequest(auth, auth.member_id, `Smart process ID expected but got: [${data.document_id}]`);
        }
        return { spId, entityTypeId };
    }

    /**
     * Wraps function call with try - catch to forward RobotException.
     * @param callback - any function that could throw errors.
     * @returns T - any value that callback should return.
     * @throws RobotException
     * @private
     */
    private static async wrap<T>(callback: () => Promise<T>): Promise<T> {
        try {
            return callback();
        } catch (e) {
            throw new RobotException(e.message);
        }
    }
}
