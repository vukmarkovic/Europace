import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import "./phonenumber.css";
import SelectOption from "../../interfaces/select.option";
import classNames from "classnames";

interface IProps {
    label: string;
    value: string[];
    items: SelectOption[];
    onChange?: (e: SelectChangeEvent<string[]>) => void;
}

/**
 * Customized select list element component.
 * Used for select available  phone codes and default phone code.
 * @see https://mui.com/material-ui/react-select/
 * @see https://mui.com/material-ui/api/form-control/
 */
export default function SelectControlPhoneCodes({ label, value, items, onChange }: IProps) {
    return (
        <Box sx={{ width: 220 }}>
            <FormControl fullWidth size="small" className={classNames({ "select-control-value": value.length > 0 })}>
                <InputLabel>{label}</InputLabel>
                <Select
                    multiple
                    value={value}
                    onChange={onChange}
                    input={<OutlinedInput label={label} />}
                    renderValue={selected => (
                        <div style={{ display: "flex" }}>
                            {items
                                .filter(item => selected.includes(item.value as string))
                                .map(item => (
                                    <div style={{ display: "flex" }}>
                                        <div className={`main-phonenumber-country-flag bx-flag-16 ${item.text}`}></div>
                                        <div>{item.value}</div>
                                    </div>
                                ))}
                        </div>
                    )}
                    MenuProps={{ style: { maxHeight: 400 } }}
                >
                    {items.map(item => (
                        <MenuItem key={item.value as string} value={item.value as string}>
                            <Checkbox checked={value.indexOf(item.value as string) > -1} />
                            <div className={`main-phonenumber-country-flag bx-flag-16 ${item.text}`}></div>
                            <ListItemText primary={item.value} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
