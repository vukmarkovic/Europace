/**
 * Available Bitrix24 API list field types
 * @see https://dev.1c-bitrix.ru/rest_help/lists/fields/lists_field_add.php
 */
const listsFieldsTypes = {
    SORT: "",
    ACTIVE_FROM: "",
    ACTIVE_TO: "",
    PREVIEW_PICTURE: "",
    PREVIEW_TEXT: "",
    DETAIL_PICTURE: "",
    DETAIL_TEXT: "",
    DATE_CREATE: "",
    CREATED_BY: "",
    TIMESTAMP_X: "",
    MODIFIED_BY: "",
    NAME: "string",
    S: "string",
    N: "double",
    L: "enumeration",
    F: "",
    G: "",
    E: "",
    "S:Date": "date",
    "S:DateTime": "",
    "S:HTML": "",
    "E:EList": "",
    "N:Sequence": "",
    "S:employee": "",
    "S:Money": "",
    "S:DiskFile": "",
    "S:ECrm": "",
    "S:map_yandex": "",
};

export default listsFieldsTypes;
