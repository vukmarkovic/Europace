import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Switch from "@mui/material/Switch";
import { InputContainer } from "../../common/ui";
import ROBOTS from "../../../constants/robots";
import SettingsService from "../../../api/settings/settings.service";

/**
 * Bitrix24 portal robot manager component.
 * Part of settings page.
 * Provides read-write operations.
 * @see SettingsService
 * @see Settings
 * @see Robot
 * @constructor
 */
export default function RobotManager() {
    const { t } = useTranslation(["settings", "common"]);
    const { data: robotsData } = useQuery("robots", SettingsService.getRobots);

    const isRobotSet = (rob: string) => {
        return robotsData?.some(x => x === rob) ?? false;
    };

    const queryClient = useQueryClient();
    const mutation = useMutation((code: string) => SettingsService.updateRobotState(ROBOTS[code], isRobotSet(code)), {
        onSuccess: () => {
            queryClient.invalidateQueries("robots");
        },
    });

    return Object.values(ROBOTS).length ? (
        <>
            <Box sx={{ display: "flex" }} mb={2}>
                <Typography variant="h5">{t("settings:robot.events")}</Typography>
            </Box>
            {robotsData && (
                <>
                    {Object.values(ROBOTS).map(item => (
                        <InputContainer key={item.CODE}>
                            <Box sx={{ display: "flex" }}>
                                <Box sx={{ flexGrow: 1, py: 1 }}>{t("settings:robot." + item.CODE)}</Box>
                                <Box>
                                    <Switch checked={isRobotSet(item.CODE)} onChange={() => mutation.mutateAsync(item.CODE)} />
                                </Box>
                            </Box>
                        </InputContainer>
                    ))}
                </>
            )}
        </>
    ) : null;
}
