import AppApiService from "./app.api.service";

/**
 * Service that provides integration with the backend API to set the placement data.
 * Wraps axios methods with required headers.
 * Uses:
 * - bitrix service;
 * - axios client.
 * @see BXApiService
 * @see axios
 */
class PlacementServiceImpl {
    /**
     * Updates placement data.
     * @see AppApiService
     * @see BXApiService
     * @see BxUser
     */
     async setPlacement(placements: string[] | []) {
        const data = {
            placements: placements
        }
        return (await AppApiService.post(`placement/update`, data)).data;
    }
}

const PlacementService = new PlacementServiceImpl()
export default PlacementService