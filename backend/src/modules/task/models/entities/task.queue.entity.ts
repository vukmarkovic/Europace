import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '../types/task.status';
import { Task } from './task.entity';

/**
 * Task queue entity model.
 * Stores tasks to execute by scheduler.
 */
@Entity()
export default class TaskQueue {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    /**
     * Task status.
     * @see TaskStatus
     */
    @Column({ default: 'PENDING' })
    status: TaskStatus;

    /**
     * Executions date. Task should be pended unit this date.
     */
    @Column()
    date: Date;

    /**
     * Error message. Stored for errored tasks.
     */
    @Column({ type: 'varchar', length: 500, default: null })
    error: string;
    
    /**
     * Foreign key on task entity.
     * @see Task
     */
    @Column()
    taskId: number;

    @ManyToOne(() => Task, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskId' })
    task: Task;
}
