import IBxApiResult from './intefaces/bx.api.result';

/**
 * Bitrix24 rest API batch calls result.
 * Used for single calls with const key `single`.
 * @see https://dev.1c-bitrix.ru/rest_help/general/lists.php
 */
export default class BxApiResult<T> implements IBxApiResult<T> {
    /**
     * key for single call
     * @private
     */
    private static SINGLE_CALL = 'single';

    /**
     * calls results
     */
    result: Record<string, T>;
    /**
     * calls errors
     */
    errors: Record<string, any>;

    constructor() {
        this.result = {};
        this.errors = {};
    }

    /**
     * single call result
     */
    get data(): T | null {
        return this.result[BxApiResult.SINGLE_CALL] ?? null;
    }
    set data(val: any) {
        this.result[BxApiResult.SINGLE_CALL] = val;
    }

    /**
     * single call error
     */
    get error(): any | null {
        return this.errors[BxApiResult.SINGLE_CALL] ?? null;
    }
    set error(val: any) {
        this.errors[BxApiResult.SINGLE_CALL] = val;
    }
}
