import { valueTypePhone } from "../../data/valuetype";
import SelectControlPhoneCodes from "../SelectControlPhoneCodes";
import phoneCodes from "../../data/phoneCodes";
import { SelectChangeEvent } from "@mui/material/Select";
import SelectControl from "../SelectControl";
import SelectOption from "../../interfaces/select.option";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { useTranslation } from "react-i18next";
import useChangeHandler from "../../hooks/select.change.callback";
import ICustomFieldProps from "./custom.field.props";
import CustomField from "./custom.field";

/**
 * Component providing additional settings selects for phone fields
 * @param field - matching field name
 * @param item - matching field configuration
 * @constructor
 */
export default function PhoneField({ field, item }: ICustomFieldProps) {
    const { t } = useTranslation();
    const changeHandler = useChangeHandler();

    return (
        <>
            {item.bitrix.fieldName && item.bitrix.fieldName.toLowerCase().includes("phone") && (
                <>
                    <CustomField name="phone" valueTypes={valueTypePhone} field={field} item={item} />

                    <div>
                        <SelectControlPhoneCodes
                            label={t("MatchingInterface:countryDialInCode")}
                            value={item.bitrix.phoneCodes || []}
                            items={phoneCodes.map(phoneCode => ({
                                value: phoneCode.code,
                                text: phoneCode.country,
                            }))}
                            onChange={(e: SelectChangeEvent<string[]>) => {
                                changeHandler(field, "phoneCodes", e.target.value);
                            }}
                        />
                    </div>

                    <div>
                        <SelectControl
                            label={t("MatchingInterface:mainCountryDialInNumberDefault")}
                            value={item.bitrix.phoneCode || ""}
                            items={phoneCodes
                                .filter(phoneCode => item.bitrix.phoneCodes?.includes(phoneCode.code))
                                .map(phoneCode => ({ value: phoneCode.code, text: phoneCode.country }))}
                            onChange={(e: SelectChangeEvent) => {
                                changeHandler(field, "phoneCode", e.target.value);
                            }}
                            renderListItem={(item: SelectOption) => (
                                <MenuItem value={item.value}>
                                    <div className={`main-phonenumber-country-flag bx-flag-16 ${item.text}`}></div>
                                    <ListItemText primary={item.value} />
                                </MenuItem>
                            )}
                            renderValue={selected => (
                                <div style={{ display: "flex" }}>
                                    <div
                                        className={`main-phonenumber-country-flag bx-flag-16 ${
                                            phoneCodes.find(phoneCode => phoneCode.code === selected)?.country
                                        }`}
                                    ></div>
                                    <div>{selected}</div>
                                </div>
                            )}
                        />
                    </div>
                </>
            )}
        </>
    );
}
