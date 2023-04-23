/**
 * Type representing Bitrix24 API call method handler
 * @see BXApiService
 */
type CallMethodHandler = (method: string, data: any) => Promise<any>;

export default CallMethodHandler;
