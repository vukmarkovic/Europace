import Column from "../../matching/types/column";
import EntityType from "../../matching/enum/entity.type";
import logger from "../../util/logger";
import AppApiService from "../service/app.api.service";

/**
 * Service providing read-write operations for matching interface.
 * Uses:
 * - backend API
 * @see AppApiService
 */
class MatchingServiceImpl {
    /**
     * Gets fields with matches for given entity.
     * @param entityType - matching entity.
     * @returns Column - matching config for entity.
     * @see Column
     */
    async list(entityType: string): Promise<Column> {
        const apiFields = (await AppApiService.get<any[]>(`matching/${entityType}`)).data;
        const column: Column = {};
        const smartProcessId = apiFields.find(f => f.base && f.match?.entity === EntityType.SMART_PROCESS)?.match?.childId ?? null;
        apiFields.forEach((field: any) => {
            column[field.code] = {
                isContract: field.base,
                type: field.type,
                bitrixTypes: field.type,
                hint: field.hint,
                linkType: field.linkType,
                bitrix: {
                    entity: field.match?.entity ? (field.match.entity as EntityType) : null,
                    fieldName: field.match?.code,
                    childType: field.match?.childType,
                    childId: Number(field.match?.childId) || field.match?.childId,
                    childName: field.match?.childCode,
                    valueType: field.match?.valueType,
                    smartProcessId: field.match?.entity === EntityType.SMART_PROCESS ? smartProcessId : null,
                    defaultValue: field.match?.defaultValue ?? null,
                    defaultView: field.match?.defaultView ?? null,
                    phoneCodes: field.match?.phoneCodes ?? null,
                    phoneCode: field.match?.defaultPhoneCode ?? null,
                },
            };
        });

        return column;
    }

    /**
     * Saves matching config for given entity.
     * @param entityType - matching entity.
     * @param items - new config.
     * @see Column
     */
    async save(entityType: string, items: Column) {
        logger.debugExact(items);
        const dto: any[] = [];
        Object.keys(items).forEach(key => {
            dto.push({
                field: key,
                entity: items[key].bitrix.entity,
                code: items[key].bitrix.fieldName,
                childType: items[key].bitrix.childType,
                childId: items[key].isContract ? items[key].bitrix.smartProcessId ?? items[key].bitrix.childId : items[key].bitrix.childId,
                childCode: items[key].bitrix.childName,
                valueType: items[key].bitrix.valueType,
                defaultValue: items[key].bitrix.defaultValue,
                defaultView: items[key].bitrix.defaultView,
                phoneCodes: items[key].bitrix.phoneCodes,
                defaultPhoneCode: items[key].bitrix.phoneCode,
            });
        });

        await AppApiService.put(`matching/${entityType}`, dto);
    }
}

const MatchingService = new MatchingServiceImpl();
export default MatchingService;
