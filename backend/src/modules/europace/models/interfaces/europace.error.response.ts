/**
 * Interface representing part of response data from Europace API.
 * May appear in any response that can return errors.
 */
export interface IEuropaceErrorResponse {
    error: string;
    error_description: string;
}
