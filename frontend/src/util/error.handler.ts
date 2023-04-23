import logger from "./logger";

/**
 * Logs errors and wraps them to localized message keys
 */
class ErrorHandlerImpl {
    /**
     * Logs errors exact on DEBUG level and returns message keys for known errors.
     * @param error - any throwable
     * @returns string - locale message key
     * @see logger.debugExact
     */
    handle(error: any): string {
        error = error?.response ?? error;
        if (!error) return "";

        if (error.status === 400) {
            if (error.data?.errors) {
                logger.debugExact(error.data.errors, "validation error");
                return "error:validation";
            }
            logger.debugExact(error, "bad request");
            return error.data?.message ? `error:${error.data.message}` : "error:badRequest";
        }

        if (error && (error.status === 403 || error.status === 401)) {
            logger.debugExact("access error");
            if (error.ex && error.ex.error === "insufficient_scope") {
                return "error:accessInsufficient";
            }
            return error.data?.message ? `error:${error.data.message}` : "error:accessDenied";
        }

        if (error && error.status === 404) {
            logger.debugExact("not found error");
            return "error:notFound";
        }

        if (error && error.status === 500) {
            logger.debugExact(error);
            return "error:unhandled";
        }

        logger.debugExact(error);
        return error?.code ? `error:${error.code}` : "error:unexpected";
    }

    /**
     * Extracts params from response for localized messages.
     * @param error - errored axios response.
     * @see i18n.t
     * @see axios
     */
    getParams(error: any) {
        return error?.response?.data?.params;
    }
}

const ErrorHandler = new ErrorHandlerImpl();
export default ErrorHandler;
