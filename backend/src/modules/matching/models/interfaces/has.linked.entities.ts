/**
 * Interface represents matching entity that may have linked entities.
 * Raw Bitrix24 API responses for linked entities writes to `raws` property.
 * @see MatchingService.parseResponse
 */
export interface IHasLinkedEntities {
    raws: Record<string, any>;
}
