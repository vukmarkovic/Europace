import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Auth } from '../../../../common/modules/auth/model/entities/auth.entity';

/**
 * Application settings entity model. Stores any settings used for client's portal.
 * Identifies clients by auth data.
 * @see Auth
 */
@Entity()
export default class AppSettings {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Foreign key on auth data entity.
     * @see Auth
     */
    @OneToOne(() => Auth, { onDelete: 'CASCADE' })
    @JoinColumn()
    auth: Auth;

    /**
     * For tests.
     * Missing @Column decorator prevents adding column in real database.
     */
    test: string = undefined;

    @Column({ default: '' })
    admins: string;

    @Column({ default: '' })
    placements: string;

    constructor(auth: Auth) {
        this.auth = auth;
        this.admins = '';
        this.placements = '';
    }
}
