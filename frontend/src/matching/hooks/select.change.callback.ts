import { useContext } from "react";
import { MatchingContext } from "../context/matching.context";
import EntityType from "../enum/entity.type";
import ColumnConfig from "../types/column.config";
import Column from "../types/column";
import ColumnBitrixConfig from "../types/column.bitrix.config";

/**
 * Generates select list onchange handler for matching interface manager.
 */
const useChangeHandler = () => {
    const { setItems, contractItem } = useContext(MatchingContext);

    return (field: string, key: keyof ColumnBitrixConfig, selectedValue: string | number | string[] | null) => {
        setItems(prevItems => {
            const newItems = copyObject(prevItems);
            let value;
            try {
                value = typeof selectedValue === "string" ? JSON.parse(selectedValue) : selectedValue;
            } catch (e) {
                value = selectedValue;
            }

            newItems[field].bitrix[key] = value?.fieldName ?? value?.value ?? value ?? null;

            switch (key) {
                // @ts-expect-error falls throw expected
                case "entity":
                    newItems[field].bitrix.smartProcessId = null;
                    newItems[field].bitrix.listId = null;
                    newItems[field].bitrix.childType = null;
                    newItems[field].bitrix.childId = null;
                    newItems[field].bitrix.childName = null;
                    newItems[field].bitrix.defaultValue = null;
                    newItems[field].bitrix.defaultView = null;
                /* falls through */
                case "smartProcessId":
                // @ts-expect-error falls throw expected
                // eslint-disable-next-line no-fallthrough
                case "listId":
                    newItems[field].bitrix.fieldName = null;
                /* falls through */
                case "fieldName":
                    newItems[field].bitrix.valueType = null;
                    newItems[field].bitrix.phoneCodes = null;
                    newItems[field].bitrix.phoneCode = null;
                    newItems[field].bitrix.defaultValue = null;
                    newItems[field].bitrix.defaultValueField = null;
                    newItems[field].bitrix.childType = value?.childType ?? null;
                    newItems[field].bitrix.childId = value?.childId ?? null;
                    newItems[field].bitrix.childName = value?.childName ?? null;
                    break;
                case "phoneCodes":
                    if (!(value as string[]).includes(newItems[field].bitrix.phoneCode || "")) {
                        newItems[field].bitrix.phoneCode = null;
                    }
                    break;
                case "defaultValue":
                    newItems[field].bitrix.defaultView = value?.text ?? null;
                    break;
            }

            if (newItems[field].isContract && "smartProcessId" === key) {
                for (const key in newItems) {
                    if (EntityType.SMART_PROCESS === newItems[key].bitrix.entity) {
                        newItems[key].bitrix.smartProcessId = newItems[field].bitrix.smartProcessId;
                    }
                }
            }

            if (
                !newItems[field].isContract &&
                "entity" === key &&
                EntityType.SMART_PROCESS === value &&
                EntityType.SMART_PROCESS === contractItem?.bitrix.entity
            ) {
                newItems[field].bitrix.smartProcessId = contractItem?.bitrix.smartProcessId || null;
            }

            return newItems;
        });
    };
};

/**
 * Clones object.
 * @param obj - source object.
 */
const copyObject = <T extends ColumnConfig | Column>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

export default useChangeHandler;
