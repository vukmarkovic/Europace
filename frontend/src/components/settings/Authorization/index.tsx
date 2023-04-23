import { useTranslation } from "react-i18next";
import { Box, Button, Link, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import SettingsService from "../../../api/settings/settings.service";
import { InputContainer } from "../../common/ui";
import { Buttons } from "../../common/layout";
import { useState } from "react";
import BxUser from "../../../bxapi/model/bx.user";
import BXApiService from "../../../bxapi/service/bx.api.service";

/**
 * Bitrix24 API auth data manager component.
 * Part of settings page.
 * Provides read-write operataions.
 * @see SettingsService
 * @see Settings
 * @constructor
 */
export default function Authorization() {
    const { t } = useTranslation(["settings", "common"]);
    const queryClient = useQueryClient();

    const { data: remoteAuth } = useQuery<BxUser>("current-auth", SettingsService.getCurrentAuth, {
        onSuccess: data => setCurrentAuth(data),
    });
    const [currentAuth, setCurrentAuth] = useState<BxUser | null>(remoteAuth ?? null);

    const mutation = useMutation(SettingsService.updateAuth, {
        onSuccess: data => {
            queryClient.setQueryData("current-auth", data);
        },
    });

    return (
        <>
            <Box sx={{ display: "flex" }} mb={2}>
                <Typography variant="h5">{t("settings:authorization.title")}</Typography>
            </Box>
            <InputContainer>
                <Box sx={{ flexGrow: 1 }}>
                    {currentAuth?.ID ? (
                        <Typography p={1} sx={{ backgroundColor: "success.light" }} variant="h6" gutterBottom component="div">
                            <Link color={"white"} underline="none" href={currentAuth.getLink(BXApiService.baseUrl)} target="_blank" rel="noreferrer">
                                {t("settings:authorization.authorized", [currentAuth.view])}
                            </Link>
                        </Typography>
                    ) : (
                        <Typography p={1} sx={{ backgroundColor: "warning.main", color: "white" }} variant="h6" gutterBottom component="div">
                            {t("settings:authorization.notAuthorized")}
                        </Typography>
                    )}
                </Box>
            </InputContainer>
            <InputContainer>
                <Buttons>
                    <Button variant="outlined" onClick={() => mutation.mutateAsync()}>
                        {t("settings:authorization.sendAuth")}
                    </Button>
                </Buttons>
            </InputContainer>
        </>
    );
}
