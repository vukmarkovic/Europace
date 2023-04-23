import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Wraps any code block to log execution time.
 * @param action - action name.
 * @param body - code block.
 * @param requestParams - request params (optional), used when whole endpoint execution profiling.
 */
@Injectable()
export default class Profiler {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    async wrap(action: string, body: () => any, requestParams: any = {}) {
        this.logger.profile(action);
        this.logger.debug(`Action ${action} started`);

        try {
            return await body();
        } finally {
            this.logger.profile(action, {
                level: 'info',
                message: `Action '${action}' executed\nRequest params: ${JSON.stringify(requestParams)}`,
            });
        }
    }
}
