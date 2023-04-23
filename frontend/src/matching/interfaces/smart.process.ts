import IField from "./field";

/**
 * Interface representing Bitrix24 API smart-process
 * @see https://dev.1c-bitrix.ru/rest_help/crm/dynamic/index.php
 */
export default interface ISmartProcess {
    id: number;
    title: string;
    entityTypeId: number;
    fields: IField[];
}
