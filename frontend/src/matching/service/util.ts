import IField from "../interfaces/field";
import ICRMFieldInfo from "../interfaces/crm.field.info";
import ICRMFieldInfoSettings from "../interfaces/crm.field.info.settings";
import EntityType from "../enum/entity.type";
import IListFieldInfo from "../interfaces/list.field.info";
import listsFieldsTypes from "../data/lists.fields.types";

/**
 * Gets parent identifier from Bitrix24 API field settings info.
 * @param settings - field settings.
 */
function getParentId(elementId: string | number | null, fieldInfo: ICRMFieldInfo | undefined): number | null {
    if (fieldInfo?.type === "crm_category") {
        return Number(elementId);
    }
    const settings = fieldInfo?.settings;
    if (!settings) return null;
    if (settings.IBLOCK_ID) return settings.IBLOCK_ID;
    if (settings.parentEntityTypeId) return settings.parentEntityTypeId;

    for (const key of Object.keys(settings)) {
        if (settings[key] === "IBLOCK_ID") return settings.IBLOCK_ID;
        if (key.startsWith("DYNAMIC_") && settings[key] === "Y") {
            return Number(key.match(/DYNAMIC_(\d+)/)?.[1]) || null;
        }
    }

    return null;
}

/**
 * Gets entity type by Bitrix24 API type code.
 * @param type - Bitrix24 API type code.
 * @param settings - Bitrix24 API field settings.
 * @param fieldKey - field key, may be used to identify smart process type.
 * @see EntityType
 */
function getParentType(type: string | undefined, settings: ICRMFieldInfoSettings | undefined, fieldKey: string) {
    switch (type) {
        case "iblock_element":
        case "iblock_section":
            return EntityType.LIST;
        case "crm_status":
            return EntityType.CRM_STATUS;
        case "crm_contact":
            return EntityType.CONTACT;
        case "employee":
            return EntityType.USER;
        case "crm_category":
            return EntityType.CRM_CATEGORY;
    }

    if (!settings) return null;
    if ((/PARENT_ID_\d+/.test(fieldKey) || /parentId\d+/.test(fieldKey)) && settings.parentEntityTypeId) return EntityType.SMART_PROCESS;

    for (const key of Object.keys(settings)) {
        if (key.startsWith("DYNAMIC_") && settings[key] === "Y") {
            return EntityType.SMART_PROCESS;
        }
    }

    return null;
}

/**
 * Converts Bitrix24 API crm entity field info to IField's
 * @param result - fields info.
 * @see IField
 */
export const prepareCRMFields = (result: any, elementId: string | number | null): IField[] => {
    const crmFields: IField[] = [];

    for (const [fieldKey, fieldInfo] of Object.entries<ICRMFieldInfo>(result)) {
        let title = fieldInfo.title ?? fieldInfo;
        if (fieldInfo.listLabel) {
            title = fieldInfo.listLabel;
        }
        if (fieldInfo.formLabel) {
            title = fieldInfo.formLabel;
        }
        crmFields.push({
            field: fieldKey,
            title,
            type: fieldInfo.type ?? "string",
            parentId: fieldInfo.statusType ?? getParentId(elementId, fieldInfo),
            parentType: getParentType(fieldInfo.type, fieldInfo.settings, fieldKey),
        });
    }
    return crmFields;
};

/**
 * Converts Bitrix24 API iblock field info to IField's
 * @param result - fields info.
 * @see IField
 * @see listsFieldsTypes
 */
export const prepareListFields = (result: any): IField[] => {
    const listFields: IField[] = [];
    for (const [fieldKey, fieldInfo] of Object.entries<IListFieldInfo>(result)) {
        listFields.push({
            field: fieldKey,
            title: fieldInfo.NAME,
            type: listsFieldsTypes[fieldInfo.TYPE] || "",
            parentId: null,
            parentType: null,
        });
    }
    return listFields;
};
