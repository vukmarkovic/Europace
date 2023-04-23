import EntityType from "../enum/entity.type";

/**
 * Bitrix24 field configuration.
 */
type ColumnBitrixConfig = {
    /**
     * Bitrix4 API entity.
     */
    entity?: EntityType | null;
    /**
     * Field name in Bitrix24 API.
     */
    fieldName?: string | null;
    /**
     * Bitrix24 smart process identifier.
     * Used for fields belong to smart process.
     */
    smartProcessId?: number | null;
    /**
     * Bitrix24 list identifier.
     * Used for fields belong to list.
     */
    listId?: number | null;
    /**
     * Value type for specific fields (e.g. phones, emails).
     * @see data/valuetype
     */
    valueType?: string | null;
    /**
     * Selected phone codes of countries
     * @see data/phoneCodes
     */
    phoneCodes?: string[] | null;
    /**
     * Default phone code.
     */
    phoneCode?: string | null;
    /**
     * Default value used when matching data from external API to Bitrix24 API.
     * Used for linked entities, contains link to entity (list element, user, etc)
     */
    defaultValue?: string | null;
    /**
     * View for default value.
     * Used to display as select option.
     */
    defaultView?: string | null;
    /**
     * Linked entity field used as default value.
     */
    defaultValueField?: string | null;
    /**
     * Linked entity type.
     */
    childType?: EntityType | null;
    /**
     * Linked entity id.
     */
    childId?: string | number | null;
    /**
     * Linked entity field name.
     */
    childName?: string | null;
    validation?: any;
};
export default ColumnBitrixConfig;
