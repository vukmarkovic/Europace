import EntityType from "../enum/entity.type";
import CallMethodHandler from "../interfaces/call.method.handler";
import { prepareCRMFields, prepareListFields } from "./util";
import RestName from "../data/rest.name";
import ISmartProcess from "../interfaces/smart.process";
import IList from "../interfaces/list";

/**
 * Service loading Bitrix24 API entity fields.
 * Also loads smart processes and lists elements.
 */
class LoadServiceImpl {
    /**
     * Loads entity fields and transforms.
     * @param handler - call Bitrix24 API method handler.
     * @param type - Bitrix24 entity type.
     * @param elementId - parent identifier, used for smart processed and lists.
     * @see EntityType
     * @see IField
     * @see prepareCRMFields
     * @see prepareListFields
     * @see https://dev.1c-bitrix.ru/rest_help/index.php
     */
    async loadFields(handler: CallMethodHandler, type?: EntityType | null, elementId?: string | number | null) {
        if (!type) return [];

        switch (type) {
            case EntityType.SMART_PROCESS:
                if (!elementId) return [];
                return prepareCRMFields((await handler("crm.item.fields", { entityTypeId: elementId })).fields, elementId);
            case EntityType.LIST:
                if (!elementId) return [];
                return prepareListFields(
                    await handler("lists.field.get", {
                        IBLOCK_TYPE_ID: "lists",
                        IBLOCK_ID: elementId,
                    })
                );
            case EntityType.CRM_CATEGORY:
                return [];
            default:
                return prepareCRMFields(await handler(`${RestName[type ?? EntityType.DUMMMY]}.fields`, {}), elementId ?? null);
        }
    }

    /**
     * Loads smart processes list.
     * @param methodHandler - call Bitrix24 API method handler.
     * @see https://dev.1c-bitrix.ru/rest_help/crm/dynamic/methodscrmitem/crm_item_list.php
     */
    async loadSP(methodHandler: CallMethodHandler): Promise<ISmartProcess[]> {
        return (await methodHandler("crm.type.list", {})).types;
    }

    /**
     * Loads list elements list.
     * @param methodHandler - call Bitrix24 API method handler.
     * @see https://dev.1c-bitrix.ru/rest_help/lists/elements/lists_element_get.php
     */
    async loadLists(methodHandler: CallMethodHandler): Promise<IList[]> {
        return await methodHandler("lists.get", { IBLOCK_TYPE_ID: "lists" });
    }
}

const LoadService = new LoadServiceImpl();
export default LoadService;
