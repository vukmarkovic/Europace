import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../../common/modules/auth/auth.service';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import MatchingService from '../matching/matching.service';
import IBxAuthData from '../bxapi/models/intefaces/bx.auth.data';

/**
 * Service handling updates for clients Bitrix24 portals.
 * Identifies portals by auth data.
 *
 * Uses:
 * - auth module (global);
 * - Bitrix24 rest API integration;
 * - matching interface.
 * @see AuthService
 * @see BxApiModule
 * @see MatchingModule
 */
@Injectable()
export default class UpdateService {
    private readonly logger = new Logger(UpdateService.name);

    static CURRENT_VERSION = 1;
    constructor(private readonly authService: AuthService, private readonly matching: MatchingService) {}

    /**
     * Handles request for update.
     * Saves new auth data before processing.
     * @param request - auth data from client's Bitrix24 portal.
     * @returns number - actual version of application.
     * @see AuthService
     * @see handleVersion
     */
    async handle(request: IBxAuthData) {
        const auth = await this.authService.getByMemberId(request.member_id);
        auth.domain = request.domain;
        auth.auth_token = request.access_token;
        auth.refresh_token = request.refresh_token;
        auth.expires = request.expires_in;
        auth.member_id = request.member_id;
        auth.active = true;

        await this.authService.save(auth);

        await this.handleVersion(auth, request);

        return UpdateService.CURRENT_VERSION;
    }

    /**
     * Executes updates for every version increment from current client's application version to actual.
     * `version` === 0 means application installation.
     * Do nothing if current version is actual.
     * @param auth - authentication data.
     * @param request - auth data from client's Bitrix24 portal.
     * @private
     */
    private async handleVersion(auth: Auth, request: IBxAuthData) {
        switch (Number(request.version)) {
            case 0:
                // Application uses matching interface, initialisation required.
                await this.matching.initiateMatching(auth);
            /* falls through */
            case 1:
            // do some updates...
            /* falls through */
            case 999: // CURRENT_VERSION - 1
                // break after last update
                this.logger.log(`${request.domain} successfully updated from ${request.version} to ${UpdateService.CURRENT_VERSION}`);
                break;
            default:
                this.logger.log(`${request.domain} is up to date`);
        }
    }
}
