/**
 * Interface representing Bitrix24 rest API batch response
 * @see BxApiResult
 */
interface IBxApiResult<T> {
    result: Record<string, T>;
    errors: Record<string, any>;
    data: T | null;
    error: any | null;
}

export default IBxApiResult;
