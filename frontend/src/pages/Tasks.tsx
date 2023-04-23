import { Page } from "../components/common/layout";
import { useTranslation } from "react-i18next";
import TaskList from "../components/tasks/TaskList";

/**
 * Represents scheduler configuration page.
 * Route: /tasks
 * @see TaskList
 * @constructor
 */
export default function Tasks() {
    const { t } = useTranslation("settings");
    return (
        <Page title={t("settings:task.title")}>
            <TaskList />
        </Page>
    );
}
