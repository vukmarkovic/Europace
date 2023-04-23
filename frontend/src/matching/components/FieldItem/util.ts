import SelectOption from "../../interfaces/select.option";
import IField from "../../interfaces/field";

/**
 * Transforms Bitrix24 API field info to select option
 * @param fields - fields info
 * @param bitrixTypes - available data types
 */
export const getFieldOptions = (fields: IField[], bitrixTypes: string): SelectOption[] => {
    return filterFields(fields, bitrixTypes).map(field => ({
        value: stringify({
            fieldName: field.field,
            childId: field.parentId,
            childType: field.parentType,
        }),
        text: field.title,
    }));
};

/**
 * Filters Bitrix24 API fields info by data type.
 * @param fields - fields info
 * @param types - data types
 */
const filterFields = (fields: IField[], types: string) => {
    return (fields ?? []).filter(
        field =>
            "" !==
                (field.type &&
                    ["crm", "iblock_element", "iblock_section", "crm_multifield", "crm_entity", "crm_", ...types?.split(",")].includes(field.type)) ||
            field.type.includes(types)
    );
};

/**
 * Global JSON.stringify wrapper
 * @param obj
 */
export const stringify = (obj: any): string => {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return "Errored";
    }
};
