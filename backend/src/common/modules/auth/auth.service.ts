import { Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './model/entities/auth.entity';
import IBxAuthData from '../../../modules/bxapi/models/intefaces/bx.auth.data';

/**
 * Returns and saves application's auth data.
 * Uses:
 * - auth repository
 */
@Injectable()
export class AuthService {
    private static _CACHE: Map<string, Auth> = new Map();
    private readonly logger: Logger = new Logger(AuthService.name);

    constructor(@InjectRepository(Auth) private repository: Repository<Auth>) {}

    /**
     * Looks for auth data by member_id.
     * Caches data if found.
     * @param memberId - member_id of Bitrix24 portal.
     * @returns Auth|null - auth data entity or null if not found.
     * @see Repository
     * @see Auth
     */
    async getByMemberId(memberId: string): Promise<Auth | null> {
        if (!memberId) return null;

        if (!AuthService._CACHE.get(memberId)) {
            const config = (await this.repository.findOne({ where: { member_id: memberId } })) ?? new Auth();
            config.member_id = memberId;
            AuthService._CACHE.set(memberId, config);
        }

        return AuthService._CACHE.get(memberId);
    }

    /**
     * Looks for auth data by client portal domain.
     * Caches data if found.
     * @param domain - domain of Bitrix24 portal.
     * @returns Auth|null - auth data entity or null if not found.
     * @see Repository
     * @see Auth
     */
    async getByDomain(domain: string): Promise<Auth> {
        if (!domain) return null;

        if (!AuthService._CACHE.get(domain)) {
            const config = (await this.repository.findOne({ where: { domain } })) ?? new Auth();
            config.domain = domain;
            AuthService._CACHE.set(domain, config);
        }

        return AuthService._CACHE.get(domain);
    }

    /**
     * Looks for auth data by app_token.
     * Used when deleting application from portal.
     * @param app_token - app_token of Bitrix24 portal.
     * @returns Auth|null - auth data entity or null if not found.
     * @see Repository
     * @see Auth
     */
    async getByToken(app_token: string): Promise<Auth | null> {
        return app_token ? await this.repository.findOne({ where: { app_token } }) : null;
    }

    /**
     * Updates or adds new auth data.
     * @param authData - auth data.
     * @returns Auth - new or updated auth data entity.
     * @see Auth
     */
    async update(authData: IBxAuthData): Promise<Auth> {
        const currentAuth = (await this.getByMemberId(authData.member_id)) ?? new Auth();

        currentAuth.member_id = authData.member_id;
        currentAuth.domain = authData.domain;
        currentAuth.auth_token = authData.access_token;
        currentAuth.refresh_token = authData.refresh_token;
        currentAuth.expires = authData.expires_in;
        currentAuth.active = true;

        await this.save(currentAuth);
        return currentAuth;
    }

    /**
     * Saves auth data to repository and updates cache.
     * @param auth - auth data.
     * @see Repository
     * @see Auth
     */
    async save(auth: Auth): Promise<void> {
        try {
            await this.repository.save(auth);
            AuthService._CACHE.set(auth.member_id, auth);
        } catch (err) {
            this.logger.error({ member_id: auth.member_id, domain: auth.domain, err });
        }
    }
}
