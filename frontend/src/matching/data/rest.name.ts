import EntityType from "../enum/entity.type";

/**
 * Representing matches between Bitrix24 API entity code and Bitrix24 rest API method prefix.
 * @see https://dev.1c-bitrix.ru/rest_help/rest_sum/index.php
 */
const RestName: Record<EntityType, string> = {
    [EntityType.USER]: "user",
    [EntityType.CONTACT]: "crm.contact",
    [EntityType.DEAL]: "crm.deal",
    [EntityType.LEAD]: "crm.lead",
    [EntityType.COMPANY]: "crm.company",
    [EntityType.SMART_PROCESS]: "crm.item",
    [EntityType.CRM_STATUS]: "crm.status",
    //todo
    CRM_CATEGORY: "",
    CRM_INVOICE: "",
    CRM_LIST: "",
    CRM_QUOTE: "",
    CRM_SONET_GROUP: "",
    DUMMY: "",
};
export default RestName;
