import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import Matching from './matching.entity';

/**
 * External API field entity model.
 * Stores description of external fields.
 */
@Entity()
@Unique('unique_field', ['id', 'code'])
export default class ApiField {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * External API field name.
     */
    @Column()
    code: string;

    /**
     * External API property path in received DTO object.
     * Supports extraction from arrays.
     * If is same as code may be null.
     * @example
     * External API response:
     * {
     *    data: {
     *       objects: [{
     *          property: 'value'
     *       }]
     *    }
     * }
     * `propertyPath` should be `data.objects[].property` to match `value` to Bitrix24 API entity field/
     */
    @Column({ default: null })
    propertyPath?: string;

    /**
     * Matching entity.
     * Any string identifier grouping fields of same external API entity.
     */
    @Column()
    entity: string;

    /**
     * Available types of Bitrix24 API fields.
     */
    @Column()
    type: string;

    /**
     * Whether field is basic for matched Bitrix24 API entity.
     * Base fields matching cannot be reconfigured and always points to Bitrix24 API entity ID (id)
     */
    @Column({ default: false })
    base: boolean;

    /**
     * Default value if no match configured.
     */
    @Column({ default: null })
    default?: string;

    /**
     * Whether value could be array.
     */
    @Column({ default: false })
    multiple: boolean;

    /**
     * Explicit type of Bitrix24 API entity that could be chosen as default value.
     */
    @Column({ default: null })
    linkType?: string;

    /**
     * Field hint.
     */
    @Column({ default: null })
    hint?: string;

    /**
     * Sorting order.
     */
    @Column({ type: 'int', default: 0 })
    sort: number;

    /**
     * One to many relation on configured matches.
     * @see Matching
     */
    @OneToMany(() => Matching, (matching) => matching.apiField)
    matching: Matching[];
}
