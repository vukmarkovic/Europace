import ColumnBitrixConfig from "../../types/column.bitrix.config";
import { SelectChangeEvent } from "@mui/material/Select";
import SelectOption from "../../interfaces/select.option";
import SelectControl from "../SelectControl";

interface IProps {
    label: string;
    field: string;
    value: string;
    bitrixKey: keyof ColumnBitrixConfig;
    items: SelectOption[];
    error?: boolean;
    readonly?: boolean;
    changeHandler: (field: string, key: keyof ColumnBitrixConfig, value: string | number | string[] | null) => void;
}

/**
 * Customized select list element component.
 * Used for select from static options list.
 * @see SelectControl
 */
export default function SelectValue({ label, field, value, bitrixKey, items, error, readonly, changeHandler }: IProps) {
    return (
        <SelectControl
            label={label}
            value={value}
            items={items}
            error={error}
            readonly={readonly}
            onChange={(e: SelectChangeEvent) => {
                changeHandler(field, bitrixKey, "entity" === bitrixKey && "None" === e.target.value ? null : e.target.value);
            }}
        />
    );
}
