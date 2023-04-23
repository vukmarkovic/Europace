/**
 * Auth identifier interface.
 * May be used when member_id only required but not actual auth entity.
 * @see Auth
 */
export interface IAuthData {
    member_id: string;
    domain?: string;
}
