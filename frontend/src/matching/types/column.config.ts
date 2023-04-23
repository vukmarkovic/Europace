import ColumnBitrixConfig from "./column.bitrix.config";
import EntityType from "../enum/entity.type";

/**
 * Type representing matching configuration for entity.
 */
type ColumnConfig = {
    /**
     * External API field type
     */
    type: string;
    /**
     * Applyable Bitrix24 API type
     */
    bitrixTypes: string;
    /**
     * Bitrix24 API field configuration
     */
    bitrix: ColumnBitrixConfig;
    /**
     * Whether field is basic. Basic fields has constraints on changing.
     */
    isContract?: boolean;
    /**
     * Field hint.
     */
    hint?: string | null;
    /**
     * Type of linked Bitrix24 entity.
     * Used transitive properties
     * (e.g. matching `externalUser` to `Bitrix24_contact => assignedByUser => ID`)
     */
    linkType?: EntityType;
};

export default ColumnConfig;
