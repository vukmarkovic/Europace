import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskType } from '../types/task.type';
import { TaskInterval } from '../types/task.interval';
import { Auth } from '../../../../common/modules/auth/model/entities/auth.entity';

/**
 * Task entity model.
 * Stores task configurations for client's Bitrix24 portal.
 * Identifies clients by auth data.
 * @see Auth
 */
@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Task type.
     */
    @Column()
    type: TaskType = 'STUB';

    /**
     * Task execution interval type.
     * If is different from `NONE` task may be requeued after execution.
     * @see TaskInterval
     */
    @Column()
    intervalType: TaskInterval = 'NONE';

    /**
     * Task execution interval. Used for requeue.
     */
    @Column({ default: 0 })
    interval: number;

    /**
     * Task execution start date. Task may be pended unit this date.
     */
    @Column({ default: null })
    startDate: Date = new Date();

    /**
     * Last task execution date.
     */
    @Column({ default: null })
    lastRunDate: Date;

    /**
     * Foreign key on auth data.
     * @see Auth
     */
    @Column()
    authId: number;

    @ManyToOne(() => Auth, (auth) => auth.id, { onDelete: 'CASCADE' })
    auth!: Auth;

    /**
     * Task additional data
     */
    @Column({ default: '' })
    data: string;

    constructor(type: TaskType, auth: Auth, data = '') {
        this.type = type;
        this.auth = auth;
        this.data = data;
    }
}
