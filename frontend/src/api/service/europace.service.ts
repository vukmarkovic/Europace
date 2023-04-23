import AppApiService from "./app.api.service";

/**
 * Service that provides integration with the backend API to get the authorization url.
 * Wraps axios methods with required headers.
 * Uses:
 * - bitrix service;
 * - axios client.
 * @see BXApiService
 * @see axios
 */
class EuropaceServiceImpl {
    /**
     * axios post
     * @param entityTypeId - SP id
     * @param entityId - SP entity id
     * @param access_token - current user access token
     * @returns
     */
    async getUrl(entityTypeId: number, entityId: number, access_token: string) {
        const body = {
            entityTypeId: entityTypeId,
            entityId: entityId,
            access_token
        };
        return (await AppApiService.post<string>(`europace/silentSignIn`, body)).data;
    }
}

const EuropaceService = new EuropaceServiceImpl();
export default EuropaceService;
