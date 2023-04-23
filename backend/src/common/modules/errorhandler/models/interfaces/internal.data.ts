import { IAuthData } from '../../../auth/model/interfaces/auth.data.interface';

/**
 * Data passed to internal errors handler.
 * @see ErrorHandler.internal
 * @see IAuthData
 */
interface IInternalData {
    /**
     * portal identification data
     */
    auth: IAuthData;
    /**
     * error message
     */
    message: string;
    /**
     * occurred error, optional
     */
    e?: any;
    /**
     * any data to log, optional
     */
    payload?: Record<string, string>;
}

export default IInternalData;
