/**
 * Error occurred during operations with Bitrix24 API robots.
 */
export default class RobotError extends Error {
    private readonly code: string;

    constructor(code: string) {
        super();
        this.code = code;
    }
}
