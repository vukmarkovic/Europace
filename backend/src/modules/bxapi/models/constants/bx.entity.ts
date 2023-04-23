const BX_ENTITY = {
    USER: 'USER',
    CONTACT: 'CRM_CONTACT',
    CONTACT_ADDRESS: 'CRM_CONTACT_ADDRESS',
    LEAD: 'CRM_LEAD',
    COMPANY: 'CRM_COMPANY',
    COMPANY_ADDRESS: 'CRM_COMPANY_ADDRESS',
    LIST: 'CRM_LIST',
    SMART_PROCESS: 'CRM_',
    ADDRESS: 'ADDRESS',
    CRM_STATUS: 'CRM_STATUS',
    FIELD: 'FIELD',
    BLOCK_SECTION: 'IBLOCK_SECTION',
    CRM_CATEGORY: 'CRM_CATEGORY',
    ENTITY_TYPE_ID: (entityType: string) => {
        switch (entityType) {
            case BX_ENTITY.CONTACT_ADDRESS:
                return 3;
            case BX_ENTITY.COMPANY_ADDRESS:
                return 4;
            default:
                return null;
        }
    },
};
export default BX_ENTITY;
