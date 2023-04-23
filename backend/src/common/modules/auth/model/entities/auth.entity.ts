import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Authentication data entity model.
 * Stores identifying data and tokens of Bitrix24 portal.
 */
@Entity()
export class Auth {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Installed application token. Unique per portal.
     * Used for uninstallation.
     */
    @Column({ default: null })
    app_token: string;

    /**
     * Bitrix24 portal identifier. Unique per portal.
     * Used to identify requesting clients.
     */
    @Column({ default: null })
    member_id: string;

    /**
     * Domain of Bitrix24 portal.
     */
    @Column({ default: null })
    domain: string;

    /**
     * Authorization token for requests to Bitrix24 API.
     */
    @Column({ default: null })
    auth_token: string;

    /**
     * Token used to refresh auth_token.
     */
    @Column({ default: null })
    refresh_token: string;

    /**
     * auth_token expire timestamp.
     */
    @Column('bigint', { default: 0 })
    expires: number;

    /**
     * Whether application is installed on clients portal.
     */
    @Column({ default: false })
    active: boolean;
}
