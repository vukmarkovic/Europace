import AppApiService from "../../api/service/app.api.service";
import logger from "../../util/logger";
import BxUser from "../model/bx.user";
import BxCall from "../types/bx.call";

declare global {
    interface Window {
        BX24: any;
    }
}

/**
 * Local js BX24 library wrapper.
 * @param method - library method to call.
 * @param args - arguments to call `method` with.
 * @returns any - `method` result or `null` if js library missing.
 * @see https://dev.1c-bitrix.ru/rest_help/js_library/index.php
 */
const BX24 = (method: string, args: any[] = []) => {
    if (!window.BX24 || !method || typeof window.BX24[method] !== "function") return null;
    return window.BX24[method](...args);
};

/**
 * Service providing integration with Bitrix24 rest API.
 * Provides:
 * - local calls with current user auth;
 * - remote calls with stored auth;
 * - helper functions.
 * @see https://dev.1c-bitrix.ru/rest_help/index.php
 */
class BXApiServiceImpl {
    private _member_id = "";
    private _domain = "";

    /**
     * Installation handler.
     * Binds application install and uninstall events to backend handlers.
     * Registers application on Bitrix24 portal.
     * @see https://dev.1c-bitrix.ru/rest_help/general/events_method/event_bind.php
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/system/installFinish.php
     */
    async install() {
        try {
            await this.callBatchLocal([
                ["event.unbind", { event: "OnAppInstall", handler: `${process.env.REACT_APP_URL}bx/handleInstall` }],
                ["event.unbind", { event: "OnAppUpdate", handler: `${process.env.REACT_APP_URL}bx/handleInstall` }],
                ["event.unbind", { event: "OnAppUninstall", handler: `${process.env.REACT_APP_URL}bx/uninstall` }],
                ["event.bind", { event: "OnAppInstall", handler: `${process.env.REACT_APP_URL}bx/handleInstall` }],
                ["event.bind", { event: "OnAppUpdate", handler: `${process.env.REACT_APP_URL}bx/handleInstall` }],
                ["event.bind", { event: "OnAppUninstall", handler: `${process.env.REACT_APP_URL}bx/uninstall` }],
            ]);
        } catch (e) {
            throw new Error("install.error");
        }

        BX24("installFinish");
    }

    /**
     * @returns boolean - whether current user is administrator of Bitrix24 portal.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/additional/isAdmin.php
     */
    get isAdmin() {
        return BX24("isAdmin");
    }

    /**
     * @returns string - base URL of current Bitrix24 portal.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/additional/getDomain.php
     */
    get baseUrl() {
        return `https://${BX24("getDomain")}`;
    }

    /**
     * @returns any - auth data of current user.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/system/getAuth.php
     */
    get authData() {
        return BX24("getAuth");
    }

    /**
     * Portal identifier getter.
     * Stores value from auth into local variable in case auth expires.
     * @returns string - Bitrix24 portal identifier, used to be unique per portal.
     * @see authData
     */
    get member_id() {
        if (!this._member_id) {
            this._member_id = this.authData?.member_id;
        }
        return this._member_id;
    }

    /**
     * Portal domain getter.
     * Stores value from auth into local variable in case auth expires.
     * @returns string domain of Bitrix24 portal stored in current user auth data.
     * @see authData
     */
    get domain() {
        if (!this._domain) {
            this._domain = this.authData?.domain;
        }
        return this._domain;
    }

    /**
     * @returns client's portal locale.
     * Supports de-DE locale, returns en-US for any other.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/additional/getLang.php
     */
    get locale() {
        if (!window.BX24) return "en-US";

        let lang = BX24("getLang");
        while (!lang) {
            lang = BX24("getLang");
        }
        switch (lang) {
            case "de-DE":
                return lang;
            case "de":
                return lang + "-" + lang.toUpperCase();
            default:
                return "en-US";
        }
    }

    /**
     * Gets current user by local call.
     * @returns BxUser - current user with isAdmin flag.
     * @see isAdmin
     * @see callMethodLocal
     * @see https://dev.1c-bitrix.ru/rest_help/users/user_current.php
     */
    async getCurrentUser(): Promise<BxUser> {
        const user = new BxUser(await this.callMethodLocal("user.current"));
        user.isAdmin = this.isAdmin;
        return user;
    }

    /**
     * @returns number - application version stored in app options by local call.
     * @see callMethodLocal
     * @see https://dev.1c-bitrix.ru/rest_help/general/application/app_option_get.php
     */
    async getAppVersion() {
        return Number(await this.callMethodLocal("app.option.get", { option: "version" })) || 0;
    }

    /**
     * Stores application version in app options by local call.
     * @param version - current version.
     * @see callMethodLocal
     * @see https://dev.1c-bitrix.ru/rest_help/general/application/app_option_set.php
     */
    async setAppVersion(version: number) {
        await this.callMethodLocal("app.option.set", { version });
    }

    /**
     * @returns any - application placement info.
     * Applications may be placed in several places with some parameters
     * which may affect application appearance and/or functionality.
     * @see https://dev.1c-bitrix.ru/rest_help/application_embedding/index.php
     */
    get placementInfo() {
        return window.BX24?.placement?.info();
    }

    /**
     * @returns string - application placement code.
     * @see https://dev.1c-bitrix.ru/rest_help/application_embedding/index.php
     */
    get placement() {
        return this.placementInfo?.placement ?? "";
    }

    /**
     * Opens new application instance in Bitrix24 portal frame.
     * Used to open some external resource in new application window.
     * To work properly requires a component that receives URL and can open it in iframe.
     * @param link - URL passed to application.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/additional/openApplication.php
     */
    openPath(link: string) {
        BX24("openApplication", [{ link }]);
    }

    /**
     * Closes the open modal window with the application
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/additional/closeapplication.php
     */
    closeApplication() {
        BX24("closeApplication");
    }

    /**
     * Executes Bitrix rest API call with stored auth data.
     * May request single call or list:
     * - /bx/callMethod
     * - /bx/getList
     * @param method - bx method
     * @param data - request data
     * @param isList - whether should to call list method.
     * @returns any - Bitrix24 rest API response.
     * @see BXApiModule of backend part for details.
     */
    async callMethod(method: string, data: any, isList = false) {
        return AppApiService.post<any>(`bx/${isList ? "getList" : "callMethod"}`, { method, data }).then(
            response => {
                logger.debugExact(response);
                if (response.data.errors.single) {
                    throw response.data.errors.single;
                }
                return response.data.result.single;
            },
            error => {
                throw error.response?.data;
            }
        );
    }

    /**
     * Executes Bitrix rest API batch call with stored auth data.
     * Requests /bx/callBatch
     * @param batch - batch of Bitrix24 API calls.
     * @returns any - batch response.
     * @see BxCall
     * @see BXApiModule of backend part for details.
     */
    callBatch(batch: BxCall[]): Promise<any> {
        return AppApiService.post<any>(`bx/callBatch`, batch).then(
            response => {
                logger.debugExact(response);

                const result = {} as any;
                Object.keys(response.data.result).forEach(key => {
                    result[key] = {
                        data: response.data.result[key],
                        error: false,
                    };
                });
                Object.keys(response.data.errors).forEach(key => {
                    result[key] = {
                        data: false,
                        error: response.data.errors[key],
                    };
                });
                return result;
            },
            error => error.response?.data
        );
    }

    /**
     * Executes Bitrix rest API call with current user auth data by BX24 library.
     * @param method - bx method
     * @param data - request data
     * @returns any - Bitrix24 rest API response.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php
     */
    callMethodLocal(method: string, data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            BX24("callMethod", [
                method,
                data,
                (response: any) => {
                    logger.debug(response);

                    if (response.error()) reject(response.error());
                    else resolve(response.data());
                },
            ]);
        });
    }

    /**
     * Executes Bitrix rest API batch call with current user auth data by BX24 library.
     * @param batch - bx batch
     * @returns any - Bitrix24 rest API batch response.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callBatch.php
     */
    callBatchLocal(batch: [string, any][]): Promise<any> {
        return new Promise(resolve => {
            BX24("callBatch", [
                batch,
                (response: any) => {
                    logger.debug(response);
                    resolve(response);
                },
            ]);
        });
    }
}

const BXApiService = new BXApiServiceImpl();
export default BXApiService;
