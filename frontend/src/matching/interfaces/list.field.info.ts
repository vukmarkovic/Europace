import listsFieldsTypes from "../data/lists.fields.types";

/**
 * Interface representing Bitrix24 API list element field info
 * @see https://dev.1c-bitrix.ru/rest_help/lists/fields/index.php
 */
export default interface IListFieldInfo {
    NAME: string;
    TYPE: keyof typeof listsFieldsTypes;
}
