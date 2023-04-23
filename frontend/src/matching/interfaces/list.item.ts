/**
 * Interface representing Bitrix24 API list element
 * @see https://dev.1c-bitrix.ru/rest_help/lists/elements/index.php
 */
export default interface IListItem {
    id: string;
    name: string;
    properties: Record<string, string>;
}
