import IField from "./field";
import IListItem from "./list.item";

/**
 * Interface representing Bitrix24 API list
 * @see https://dev.1c-bitrix.ru/rest_help/lists/lists/index.php
 */
export default interface IList {
    ID: string;
    NAME: string;
    fields: IField[];
    items: IListItem[];
}
