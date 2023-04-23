import { useTranslation } from "react-i18next";
import { Page } from "../components/common/layout";
import MatchingInterface from "../matching/components/MatchingInterface";
import MatchingService from "../api/matching/matching.service";
import Column from "../matching/types/column";
import EntityType from "../matching/enum/entity.type";
import BXApiService from "../bxapi/service/bx.api.service";

/**
 * Represents matching interface configuration page.
 * Route: /matching
 * Provides entities basic configuration for matching interface.
 * @see MatchingService
 * @see MatchingInterface
 * @constructor
 */
export default function Matching() {
    const { t } = useTranslation(["common", "MatchingInterface"]);

    const loadItems = async (entityType: string) => await MatchingService.list(entityType);

    const save = async (entity: string, items: Column) => {
        await MatchingService.save(entity, items);
    };

    const matchingConfig = {
        CREDENTIALS: [EntityType.SMART_PROCESS],
        CUSTOMER: [EntityType.CONTACT],
        LEAD: [EntityType.SMART_PROCESS],
        OBJECT: [EntityType.SMART_PROCESS],
        CHILDREN: [EntityType.SMART_PROCESS],
        MONTHLY_BUDGET: [EntityType.SMART_PROCESS],
        JOB: [EntityType.SMART_PROCESS],
        PASSPORT: [EntityType.SMART_PROCESS],
        APPLICANT: [EntityType.SMART_PROCESS],
        BANK_ACCOUNT: [EntityType.SMART_PROCESS],
        EXISTING_PROPERTY: [EntityType.SMART_PROCESS],
        APPLICATION: [EntityType.SMART_PROCESS],
        DOCUMENT: [EntityType.SMART_PROCESS],
    };

    return (
        <Page title={t("common:nav.matching")}>
            <MatchingInterface
                configs={matchingConfig}
                loadHandler={loadItems}
                saveHandler={save}
                bxMethodHandler={(method, data) => BXApiService.callMethod(method, data)}
                buttonTitle={t("common:button.save")}
            />
        </Page>
    );
}
