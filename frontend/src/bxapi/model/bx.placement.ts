/**
 * Class representing Bitrix24 API user response.
 * Provides view and user's profile page link getters.
 */
export default class BxPlacement{
    title: string = "";
    entityTypeId: string = "";

    constructor(data: any) {
        Object.assign(this, data || {});
    }
}
