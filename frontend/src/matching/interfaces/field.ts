import EntityType from "../enum/entity.type";

/**
 * Interface representing transformed Bitrix24 API field info
 */
export default interface IField {
    field: string;
    title: string;
    type: string;
    parentId: string | number | null;
    parentType: EntityType | null;
}
