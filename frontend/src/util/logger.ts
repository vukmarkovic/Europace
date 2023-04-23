/**
 * Custom console logger.
 * May be configured to log specified levels.
 * By default logs warnings and errors for production environment anf all for others.
 */
class Logger {
    DEBUG: boolean;
    WARNING: boolean;
    ERROR: boolean;

    constructor() {
        this.DEBUG = process.env.REACT_APP_ENV !== "production";
        this.WARNING = true;
        this.ERROR = true;
    }

    /**
     * Logs json stringified message with label.
     * DEBUG level.
     * @param msg - any data to log.
     * @param label - label (optional), DEBUG by default.
     * @see console.log
     */
    debug(msg: any, label?: string) {
        if (!this.DEBUG) return;
        try {
            console.log((label || "DEBUG") + ": " + JSON.stringify(msg));
        } catch (e) {
            console.log(label || "DEBUG");
            console.log(msg);
        }
    }

    /**
     * Logs `obj` as is.
     * DEBUG level.
     * @param obj - any object.
     * @param label - label (optional), DEBUG by default.
     * @see console.log
     */
    debugExact(obj: unknown, label?: string) {
        if (!this.DEBUG) return;
        console.log(label || "DEBUG", obj);
    }

    /**
     * Logs message.
     * WARNING level.
     * @param msg - any message to log.
     * @see console.warning
     */
    warn(msg: string) {
        if (this.WARNING) console.warn(msg);
    }

    /**
     * Logs `msg` object as is.
     * ERROR level.
     * @param msg
     * @see console.error
     */
    error(msg: any) {
        if (this.ERROR) console.error(msg);
    }
}

export default new Logger();
