import Matching from '../entities/matching.entity';

/**
 * DTO class representing Matching entity.
 * @see Matching
 */
export default class MatchDto {
    field?: string;
    entity: string;
    code: string;
    childType: string | null;
    childId: string | null;
    childCode: string | null;
    valueType: string | null;
    defaultValue: string | null;
    defaultView: string | null;
    phoneCodes: string[] | null;
    defaultPhoneCode: string | null;

    constructor(entity: Matching) {
        if (!entity) return;

        this.entity = entity.entity;
        this.code = entity.code;
        this.childType = entity.childType ?? null;
        this.childId = entity.childId ?? null;
        this.childCode = entity.childCode ?? null;
        this.valueType = entity.valueType ?? null;
        this.defaultValue = entity.defaultValue;
        this.defaultView = entity.defaultView;
        this.phoneCodes = entity.phoneCodes?.split(',') ?? null;
        this.defaultPhoneCode = entity.defaultPhoneCode;
    }
}
