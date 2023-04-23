import FieldDto from '../../../matching/models/dto/field.dto';

/**
 * Interface represents set of external api fields with matches,
 * some identifying field and entityTypeId (optional, for smart processes only)
 * Used by task processors.
 * @see FieldDto
 * @see TaskHelper
 */
export interface IEntityMatch {
    fields: FieldDto[];
    idField: string;
    entityTypeId?: string;
}
