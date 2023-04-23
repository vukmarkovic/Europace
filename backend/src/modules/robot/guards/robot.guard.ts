import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../../../common/modules/auth/auth.service';
import IBxRobotData from '../models/interfaces/bx.robot.data';
import REGISTERED_ROBOTS from '../models/constants/robots';
import { ErrorHandler } from '../../../common/modules/errorhandler/error.handler.service';

/**
 * Checks:
 * - robot data
 * - robot availability
 * - auth data.
 *
 * If all checks passed, adds auth to request.
 */
@Injectable()
export default class RobotGuard implements CanActivate {
    private readonly logger = new Logger(RobotGuard.name);

    constructor(private readonly authService: AuthService, private readonly errorHandler: ErrorHandler) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const data: IBxRobotData = request.body;

        this.checkData(data);
        this.checkRobot(data);
        const auth = await this.authService.getByMemberId(data.auth.member_id);

        if (!auth?.active) {
            return false;
        }

        request.auth = auth;
        return true;
    }

    private checkData(data: IBxRobotData) {
        if (!data || !data.code || !data.document_id || !data.document_type || !data.auth?.member_id) {
            this.logger.error({ message: 'Bad robot data', payload: data });
            this.errorHandler.badRequest(
                data?.auth ?? {
                    member_id: 'unknown',
                    domain: 'unknown',
                },
                `Seems not to be a robot call`,
            );
        }
    }

    private checkRobot(data: IBxRobotData) {
        if (!Object.values(REGISTERED_ROBOTS).includes(data.code)) {
            this.errorHandler.badRequest(data.auth, `Unexpected robot: [${data.code}]`);
        }
    }
}
