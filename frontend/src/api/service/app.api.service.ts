import axios from "axios";
import BXApiService from "../../bxapi/service/bx.api.service";

/**
 * Service providing integration with backend API.
 * Wraps axios methods with required headers.
 * Uses:
 * - bitrix service;
 * - axios client.
 * @see BXApiService
 * @see axios
 */
class AppApiServiceImpl {
    /**
     * bx auth headers
     * @returns
     */
    authHeaders() {
        return {
            "bitrix24-portal": BXApiService.domain,
            "bitrix24-memberid": BXApiService.member_id,
        };
    }

    /**
     * axios get
     * @param url - request url
     * @returns
     */
    get<T>(url: string) {
        return axios.get<T>(url, {
            headers: this.authHeaders(),
        });
    }

    /**
     * axios post
     * @param url - request url
     * @param data - request data
     * @returns
     */
    post<T>(url: string, data: any = {}) {
        return axios.post<T>(url, data, {
            headers: this.authHeaders(),
        });
    }

    /**
     * axios put
     * @param url - request url
     * @param data - request data
     * @returns
     */
    put<T>(url: string, data: any = {}) {
        return axios.put<T>(url, data, {
            headers: this.authHeaders(),
        });
    }
}

const AppApiService = new AppApiServiceImpl();
export default AppApiService;
