import { useTranslation } from "react-i18next";
import { Page } from "../components/common/layout";
import Authorization from "../components/settings/Authorization";
import RobotManager from "../components/settings/RobotManager";
import AdminList from "../components/settings/AdminList";
import Placement from "../components/settings/Placement";
/**
 * Represents settings page.
 * Route: /settings
 * Provides settings blocks:
 * - admin list mamager
 * - robot manager
 * - Bitrix24 API authorization manager
 * - settings placement auth button in SP
 * @see RobotManager
 * @see ApiCredentials
 * @see Authorization
 * @see Placement
 * @constructor
 */
export default function Settings() {
    const { t } = useTranslation("settings");

    return (
        <Page title={t("title")}>
            <AdminList />
            <Authorization />
            <RobotManager />
            <Placement/>
        </Page>
    );
}
