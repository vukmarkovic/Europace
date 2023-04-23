import ICustomFieldProps from "./custom.field.props";
import { useTranslation } from "react-i18next";
import { useSelectProps } from "../../hooks/select.props";
import SelectValue from "../SelectValue";
import SelectOption from "../../interfaces/select.option";

interface IProps extends ICustomFieldProps {
    name: string;
    valueTypes: SelectOption[];
}

/**
 * Component providing additional settings selects for typed fields fields
 * @param name - field name part
 * @param valueTypes - avaylable value types
 * @param field - matching field name
 * @param item - matching field configuration
 * @see data/valuetype/index
 * @constructor
 */
export default function CustomField({ name, valueTypes, field, item }: IProps) {
    const { t } = useTranslation();
    const selectOptions = useSelectProps(field, item);

    return (
        <>
            {item.bitrix.fieldName && item.bitrix.fieldName.toLowerCase().includes(name) && (
                <div>
                    <SelectValue
                        items={valueTypes.map(valueTypesItem => ({
                            value: valueTypesItem.value,
                            text: t(valueTypesItem.text),
                        }))}
                        {...selectOptions("type", "valueType")}
                    />
                </div>
            )}
        </>
    );
}
