import ICRMFieldInfoSettings from "./crm.field.info.settings";

/**
 * Interface representing Bitric24 API CRM entity field info
 * @see ICRMFieldInfoSettings
 * @see https://dev.1c-bitrix.ru/rest_help/crm/userfields/index.php
 */
export default interface ICRMFieldInfo {
    title: string;
    type: string;
    listLabel?: string;
    formLabel?: string;
    settings?: ICRMFieldInfoSettings;
    statusType?: string;
}
