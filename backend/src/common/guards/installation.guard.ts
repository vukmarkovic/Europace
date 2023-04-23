import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../modules/auth/auth.service';

/**
 * Reads header `bitrix24-memberid` from request and look for auth data.
 * If auth exists and is active, adds auth to request
 * @see AuthService
 */
@Injectable()
export default class InstallationGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const bx24memberId = request.headers?.['bitrix24-memberid'];
        const auth = await this.authService.getByMemberId(bx24memberId);

        if (!auth?.active) {
            return false;
        }

        request.auth = auth;
        return true;
    }
}
