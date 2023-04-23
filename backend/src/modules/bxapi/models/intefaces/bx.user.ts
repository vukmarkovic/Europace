/**
 * Interface represents Bitrix24 API user.
 * @see https://dev.1c-bitrix.ru/rest_help/users/index.php
 */
interface IBxUser {
    ACTIVE: boolean;
    EMAIL: string | null;
    ID: string | null;
    LAST_NAME: string | null;
    NAME: string | null;
    PERSONAL_MOBILE: string | null;
    PERSONAL_PHONE: string | null;
    SECOND_NAME: string | null;
    UF_DEPARTMENT: number[];
    WORK_PHONE: string | null;
    isAdmin: boolean;
}

export default IBxUser;
