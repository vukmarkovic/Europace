/**
 * Class provides robot exception
 */
export default class RobotException extends Error {
    constructor(message: string) {
        super(message);
    }
}
