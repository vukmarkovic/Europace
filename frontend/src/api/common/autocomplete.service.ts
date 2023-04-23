import Option from "../../components/common/ui/AsyncSelect/types/option";
import BXApiService from "../../bxapi/service/bx.api.service";
import BxCall from "../../bxapi/types/bx.call";
import BxUser from "../../bxapi/model/bx.user";

/**
 * Service providing search functions for async selects.
 * @see AsyncSelect
 */
class AutocompleteServiceImpl {
    /**
     * Looks for active Bitrix24 portal users by name, last name or email.
     * @param term - search term.
     * @see BXApiService
     * @see callBatch
     */
    async userSearch(term: string) {
        const items: Option[] = [];
        const batchData: BxCall[] = [
            { id: "find", method: "user.search", data: { ACTIVE: "Y", FIND: term } },
            { id: "email", method: "user.get", data: { ACTIVE: "Y", EMAIL: `${term}%` } },
        ];

        const result = await BXApiService.callBatch(batchData);
        Object.keys(result).forEach(key => {
            if (result[key].error) {
                return;
            }
            result[key].data.forEach((entity: any) => {
                if (!items.find(x => x.value === entity.ID)) {
                    const user = new BxUser(entity);
                    items.push({
                        value: user.ID ?? "",
                        label: user.view,
                    });
                }
            });
        });

        return items;
    }

    /**
     * Searches for list of SP in Bitrix24 API.
     * @param term - search term.
     */
    async processSearch(term: string) {
        let items: Option[] = [];
        const filter: any = {};
        if (term?.trim()) {
            filter['%title'] = term.trim();
        }

        const result = await BXApiService.callMethod('crm.type.list', { filter });

        if (Array.isArray(result.types)) {
        items = (result.types as any[]).map(x => {
            return {
                value: x.entityTypeId,
                label: x.title
            }
        })
        }

        return items;
    }
}

const AutocompleteService = new AutocompleteServiceImpl();
export default AutocompleteService;
