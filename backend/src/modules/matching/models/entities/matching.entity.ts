import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import ApiField from './api.field.entity';
import { Auth } from '../../../../common/modules/auth/model/entities/auth.entity';

/**
 * Matching entity model.
 * Stores matching configurations for client's Bitrix24 portal.
 * Identifies clients by auth data.
 * @see Auth
 */
@Entity()
export default class Matching {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Matching entity
     */
    @Column()
    entity: string;

    /**
     * Bitrix24 API entity filed name
     */
    @Column()
    code: string;

    /**
     * Bitrix24 entity type for linked entity.
     * Commonly used when matching external API field to Bitrix24 list or smart process element.
     * @see BX_ENTITY
     */
    @Column({ default: null })
    childType?: string;

    /**
     * Bitrix24 entity identifier for linked entity.
     * Commonly used when matching external API field to Bitrix24 list or smart process element to identify list/SP.
     */
    @Column({ default: null })
    childId?: string;

    /**
     * Bitrix24 API linked entity field name.
     * Used to pass through external API value.
     * @example
     * external `firmName` matching to BX24 contact -> company -> title,
     * when BX24 contact is basic matching entity, and BX24 company is linked to that contact.
     */
    @Column({ default: null })
    childCode?: string;

    /**
     * Value type of specific Bitrix24 API fields.
     * @see TypedValues
     */
    @Column({ default: null })
    valueType?: string;

    /**
     * Default value for matched field.
     * Commonly identifier of some entity or list element is used.
     */
    @Column({ default: null })
    defaultValue?: string;

    /**
     * Default value view.
     * May be used by frontend to display initial select option.
     * Commonly name/title of some entity or list element.
     */
    @Column({ default: null })
    defaultView?: string;

    /**
     * Available phone codes. Array-like string.
     * Used for phone matches only.
     * If phone value from external API doesn't contain one of thees codes `defaultPhoneCode` is used.
     * @see TypedValues
     * @see MatchingInterface.wrapValue
     * @see defaultPhoneCode
     */
    @Column({ default: null })
    phoneCodes: string | null;

    /**
     * Phone country code by default.
     * Used for phone matches only.
     * @see TypedValues
     * @see MatchingInterface.wrapValue
     * @see defaultPhoneCode
     */
    @Column({ default: null })
    defaultPhoneCode: string | null;

    /**
     * Foreign key on external API field description.
     * @see ApiField
     */
    @ManyToOne(() => ApiField, (apiField) => apiField.matching, { onDelete: 'CASCADE' })
    @JoinColumn()
    apiField: ApiField;

    /**
     * Foreign key on auth data.
     * @see Auth
     */
    @Column()
    authId: number;

    @ManyToOne(() => Auth, (auth) => auth.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authId' })
    auth: Auth;
}
