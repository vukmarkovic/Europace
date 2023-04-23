import ColumnConfig from "../../types/column.config";

/**
 * Interface representing common props for custom field components.
 * @see CustomField
 * @see PhoneField
 */
export default interface ICustomFieldProps {
    field: string;
    item: ColumnConfig;
}
