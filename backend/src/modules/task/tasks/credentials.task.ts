import { Injectable, Logger } from '@nestjs/common';
import { Task } from '../models/entities/task.entity';
import { BxApiService } from '../../bxapi/bx.api.service';
import MatchingEntityEnum from '../../../common/enums/matching.entity.enum';
import TaskHelper from '../utils/task.helper';
import { TaskService } from '../task.service';

@Injectable()
export default class CredentialsTask {
    private readonly logger = new Logger(CredentialsTask.name);

    constructor(private readonly bx: BxApiService, private readonly helper: TaskHelper) {}

    /**
     * Start sync data from Europace to Bitrix24.
     * Gets credentials from Bitrix24 by filter service name and start new task for each one.
     *
     * Wraps known errors into MatchException, so task could notice Bitrix24 portal users.
     * @param taskService - TaskService.
     * @param task - task item.
     * @throws MatchException if matching is incorrect.
     * @see TaskService
     * @see MatchingService
     * @see BxApiService
     */
    async process(task: Task, taskService: TaskService) {
        const {
            idField: serviceField,
            entityTypeId: credentialsEntityTypeIdField,
            fields: fields,
        } = await this.helper.getMatch(task.auth, MatchingEntityEnum.CREDENTIALS, 'service');

        const serviceId = fields.find((f) => f.code === 'service')?.match?.defaultValue;
        if (!serviceId) return;

        const credentials = (
            await this.bx.getList<{ id: number }>(task.auth, {
                method: 'crm.item.list',
                data: {
                    select: ['id'],
                    filter: { [`=${serviceField}`]: [serviceId] },
                    entityTypeId: credentialsEntityTypeIdField,
                },
            })
        ).data;

        if (credentials.length < 1) {
            return;
        }

        this.logger.log({ domain: task.auth.domain, member_id: task.auth.member_id, message: 'Credentials to process ' + credentials.length });

        for (const spCredentials of credentials) {
            await taskService.queueTask(task.auth, 'GET_CUSTOMERS_BY_CREDENTIALS', `${spCredentials.id}`);
        }
    }
}
