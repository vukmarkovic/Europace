/**
 * Interface representing Bitrix24 rest API call
 */
interface IBxApiCall {
    /**
     * call id, used to refer in results
     */
    id?: string;
    /**
     * method to execute
     * @see https://dev.1c-bitrix.ru/rest_help/index.php
     */
    method: string;
    /**
     * request payload
     */
    data: any;
    /**
     * offset, used for list methods
     */
    start?: number;
}
export default IBxApiCall;
