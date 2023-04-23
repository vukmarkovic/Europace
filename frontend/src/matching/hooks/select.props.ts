import { useTranslation } from "react-i18next";
import ColumnConfig from "../types/column.config";
import ColumnBitrixConfig from "../types/column.bitrix.config";
import useChangeHandler from "./select.change.callback";
import { stringify } from "../components/FieldItem/util";

/**
 * Generates common select list options for matching interface manager.
 * @param field - matching field name.
 * @param item - matching configuration.
 */
export const useSelectProps = (field: string, item: ColumnConfig) => {
    const { t } = useTranslation();
    const changeHandler = useChangeHandler();

    return (labelKey: string, bitrixKey: keyof ColumnBitrixConfig = "fieldName") => ({
        label: t(`MatchingInterface:${labelKey}`),
        value: wrapSelectValue(item, bitrixKey),
        field,
        changeHandler,
        bitrixKey,
    });
};

/**
 * Wraps select list value by configuration key.
 * If used for matched field provides additional data.
 * @param item - matching configuration.
 * @param bitrixKey - configuration key
 */
export const wrapSelectValue = (item: ColumnConfig, bitrixKey: keyof ColumnBitrixConfig) =>
    item.bitrix[bitrixKey] && (bitrixKey === "fieldName" || bitrixKey === "childName" || bitrixKey === "defaultValue")
        ? stringify({
              fieldName: item.bitrix[bitrixKey] || "",
              childId: bitrixKey === "fieldName" ? item.bitrix.childId ?? null : null,
              childType: bitrixKey === "fieldName" ? item.bitrix.childType ?? null : null,
              defaultView: bitrixKey === "defaultValue" ? item.bitrix.defaultView ?? null : undefined,
          })
        : item.bitrix[bitrixKey]
        ? item.bitrix[bitrixKey]
        : "entity" === bitrixKey
        ? "None"
        : "";
