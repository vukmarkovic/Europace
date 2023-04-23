/**
 * Class representing Bitrix24 API user response.
 * Provides view and user's profile page link getters.
 */
export default class BxUser {
    ACTIVE = true;
    EMAIL: string | null = null;
    ID: string | null = null;
    LAST_NAME: string | null = null;
    NAME: string | null = null;
    PERSONAL_MOBILE: string | null = null;
    PERSONAL_PHONE: string | null = null;
    SECOND_NAME: string | null = null;
    UF_DEPARTMENT: number[] = [];
    WORK_PHONE: string | null = null;
    isAdmin = false;

    constructor(data: any) {
        Object.assign(this, data || {});
    }

    get view(): string {
        return [this.LAST_NAME, this.NAME, this.SECOND_NAME].filter(s => !!s).join(" ") || (this.EMAIL ?? "");
    }

    getLink(baseUrl: string): string {
        return `${baseUrl}/company/personal/user/${this.ID}/`;
    }
}
