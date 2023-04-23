import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import ApiField from './api.field.entity';

/**
 * Default matching for known fields entity model.
 * Stores default matching configurations which will be added for client's portal while initialization.
 * @see MatchingService.initiateMatching
 */
@Entity()
export default class DefaultMatching {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Bitrix24 API entity.
     * @see BX_ENTITY
     */
    @Column()
    entity: string;

    /**
     * Bitrix24 API field name
     */
    @Column()
    code: string;

    /**
     * Value type of specific Bitrix24 API fields.
     * @see TypedValues
     */
    @Column({ default: null })
    valueType?: string;

    /**
     * Foreign key on external API field description.
     * @see ApiField
     */
    @Column()
    apiFieldId: number;

    @OneToOne(() => ApiField, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'apiFieldId' })
    apiField: ApiField;
}
