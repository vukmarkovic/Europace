import MatchDto from './match.dto';
import ApiField from '../entities/api.field.entity';

/**
 * DTO class representing ApiField entity.
 * @see ApiField
 */
export default class FieldDto {
    code: string;
    propertyPath: string | null;
    match: MatchDto | null;
    type: string;
    base: boolean;
    default: string;
    linkType: string;
    multiple: boolean;
    hint: string;

    constructor(entity: ApiField) {
        if (!entity) return;

        this.code = entity.code;
        this.propertyPath = entity.propertyPath;
        this.type = entity.type;
        this.base = entity.base ?? false;
        this.match = entity.matching?.[0] ? new MatchDto(entity.matching[0]) : null;
        if (this.match) {
            this.match.field = entity.code;
        }
        this.default = entity.default;
        this.linkType = entity.linkType;
        this.multiple = entity.multiple;
        this.hint = entity.hint;
    }
}
