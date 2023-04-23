/**
 * Represents Bitrix24 rest API call format used by backend
 */
type BxCall = {
    /**
     * call identifier
     */
    id: string;
    /**
     * Birix24 rest API method
     * @see https://dev.1c-bitrix.ru/rest_help/index.php
     */
    method: string;
    /**
     * payload of call
     */
    data: any;
};

export default BxCall;
