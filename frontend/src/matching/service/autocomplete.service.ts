import EntityType from "../enum/entity.type";
import CallMethodHandler from "../interfaces/call.method.handler";

/**
 * Service providing search functions for async selects.
 * @see AutocompleteSelect
 */
class AutocompleteServiceImp {
    /**
     * Searches for list of entities in Bitrix24 API.
     * @param term - search term.
     * @param entity - Bitrix24 entity.
     * @param handler - call Bitrix24 API handler.
     * @param parentId - parent identifier, used for smart processed and lists.
     * @see getRequest
     */
    async search(term: string, entity: EntityType, handler: CallMethodHandler, parentId?: string | number | null) {
        try {
            const request = AutocompleteServiceImp.getRequest(entity, term, parentId);
            if (!request) return [];

            const response = await handler(...request);
            return (response.items ?? response.categories ?? response).map((item: any) => AutocompleteServiceImp.transform(item, entity));
        } catch (e) {
            return [];
        }
    }

    /**
     * Generates batch request to Bitrix24 API.
     * @param entity - Bitrix24 API entity.
     * @param term - search term.
     * @param parentId - parent identifier, used for smart processed and lists.
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callBatch.php
     * @private
     */
    private static getRequest(entity: EntityType, term: string, parentId?: string | number | null): [string, any] | false {
        term = (term ?? "").trim();
        switch (entity) {
            case EntityType.USER:
                return ["user.search", { ACTIVE: "Y", FIND: term }];
            case EntityType.COMPANY:
                return ["crm.company.list", { filter: { "%TITLE": term } }];
            case EntityType.LIST:
                return parentId
                    ? [
                          "lists.element.get",
                          {
                              IBLOCK_TYPE_ID: "lists",
                              IBLOCK_ID: parentId,
                              FILTER: { NAME: term + "%" },
                          },
                      ]
                    : false;
            case EntityType.SMART_PROCESS:
                return parentId
                    ? [
                          "crm.item.list",
                          {
                              entityTypeId: parentId,
                              select: ["id", "title"],
                              filter: { title: term + "%" },
                          },
                      ]
                    : false;
            case EntityType.CRM_STATUS:
                return parentId
                    ? [
                          "crm.status.list",
                          {
                              filter: {
                                  ENTITY_ID: parentId,
                                  NAME: term + "%",
                              },
                          },
                      ]
                    : false;
            case EntityType.CRM_CATEGORY:
                return parentId ? ["crm.category.list", { entityTypeId: parentId }] : false;
            default:
                throw new Error("unsupported entity: " + entity);
        }
    }

    /**
     * Transforms Bitrix24 API response to select options.
     * @param item - response item.
     * @param entity - Bitrix24 API entity.
     * @see SelectOption
     * @private
     */
    private static transform(item: any, entity: EntityType) {
        switch (entity) {
            case EntityType.USER:
                return {
                    value: item.ID,
                    text: [item.NAME, item.LAST_NAME].filter(s => !!s).join(" "),
                };
            case EntityType.COMPANY:
                return {
                    value: item.ID,
                    text: item.TITLE,
                };
            case EntityType.LIST:
                return {
                    value: item.ID,
                    text: item.NAME,
                };
            case EntityType.CRM_STATUS:
                return {
                    value: item.STATUS_ID,
                    text: item.NAME,
                };
            case EntityType.SMART_PROCESS:
                return {
                    value: item.id,
                    text: item.title,
                };
            case EntityType.CRM_CATEGORY:
                return {
                    value: item.id,
                    text: item.name,
                };
            default:
                return null;
        }
    }
}

const AutocompleteService = new AutocompleteServiceImp();
export default AutocompleteService;
