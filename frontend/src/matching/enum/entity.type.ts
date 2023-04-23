/**
 * Available Bitrix24 API entity type codes for matching interface manager
 */
enum EntityType {
    DUMMMY = "DUMMY",
    // Лид
    LEAD = "CRM_LEAD",
    // Сделка
    DEAL = "CRM_DEAL",
    // Счет
    INVOICE = "CRM_INVOICE",
    // Коммерческое предложение
    QUOTE = "CRM_QUOTE",
    // Контакт
    CONTACT = "CRM_CONTACT",
    // Компания
    COMPANY = "CRM_COMPANY",
    // Группа
    SONET_GROUP = "CRM_SONET_GROUP",
    // Смарт-процесс
    SMART_PROCESS = "CRM_",
    // Универсальный список
    LIST = "CRM_LIST",
    USER = "USER",
    CRM_STATUS = "CRM_STATUS",
    /**
     * Pipeline\funnel
     */
    CRM_CATEGORY = "CRM_CATEGORY",
}

export default EntityType;
