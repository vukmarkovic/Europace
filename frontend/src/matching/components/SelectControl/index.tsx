import React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import SelectOption from "../../interfaces/select.option";
import classNames from "classnames";
import classes from "./index.module.css";

interface IProps {
    label: string;
    value: string;
    disabled?: boolean;
    error?: boolean;
    noValueHighlight?: boolean;
    items: SelectOption[];
    onChange?: (e: SelectChangeEvent) => void;
    renderListItem?: (item: SelectOption) => React.ReactNode;
    renderValue?: (item: string) => React.ReactNode;
    readonly?: boolean;
}

/**
 * Customized select list element component.
 * @see https://mui.com/material-ui/react-select/
 * @see https://mui.com/material-ui/api/form-control/
 */
export default function SelectControl({ label, value, disabled, error, noValueHighlight, items, onChange, renderListItem, renderValue, readonly }: IProps) {
    return (
        <Box sx={{ width: 220 }}>
            <FormControl
                fullWidth
                size="small"
                className={classNames({
                    [classes.selectControlError]: error,
                    [classes.selectControlValue]: value && noValueHighlight,
                })}
            >
                <InputLabel>{label}</InputLabel>
                <Select
                    value={value}
                    label={label}
                    disabled={disabled}
                    readOnly={readonly}
                    onChange={onChange}
                    renderValue={renderValue}
                    MenuProps={{ style: { maxHeight: 400 } }}
                >
                    {items.map(item =>
                        renderListItem ? (
                            renderListItem(item)
                        ) : (
                            <MenuItem key={item.value} value={item.value}>
                                {item.text}
                            </MenuItem>
                        )
                    )}
                </Select>
            </FormControl>
        </Box>
    );
}
