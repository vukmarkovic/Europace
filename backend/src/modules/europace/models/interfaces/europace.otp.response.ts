import { IEuropaceErrorResponse } from './europace.error.response';

/**
 * Interface representing response data from Europace API endpoint:
 * -/authorize/silent-sign-in - to get OTP
 */
export interface IEuropaceOtpResponse extends IEuropaceErrorResponse {
    otp: string;
}
