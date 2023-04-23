import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Box, Button, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import { InputContainer } from "../../common/ui";
import { Buttons } from "../../common/layout";
import { AsyncSelect } from "../../common/ui";
import Option from "../../common/ui/AsyncSelect/types/option";
import AutocompleteService from "../../../api/common/autocomplete.service";
import SettingsService from "../../../api/settings/settings.service";

/**
 * Bitrix24 portal admin list manager component.
 * Part of settings page.
 * Provides read-write operations.
 * @see SettingsService
 * @see Settings
 * @see Robot
 * @constructor
 */
export default function AdminList() {
    const { t } = useTranslation(["settings", "common"]);
    const [edit, setEdit] = useState(false);
    const queryClient = useQueryClient();
    const { data: admins } = useQuery<Option[] | null>("app-admins", SettingsService.listAdmins, {
        onSuccess: admins => setAdminsData(admins),
    });
    const [adminsData, setAdminsData] = useState<Option[] | null>(admins ?? null);

    const mutation = useMutation(() => SettingsService.updateAdmins(adminsData), {
        onSuccess: () => {
            queryClient.setQueryData("app-admins", adminsData);
        },
    });

    return (
        <>
            <Box sx={{ display: "flex" }} mb={2}>
                <Typography variant="h5">{t("settings:adminlist.title")}</Typography>
            </Box>
            <InputContainer>
                <AsyncSelect
                    value={adminsData}
                    onChange={(selected: Option[] | null) => {
                        setAdminsData(selected);
                    }}
                    options={AutocompleteService.userSearch}
                    required
                    label={t("settings:adminlist.select")}
                    multiple
                    disabled={!edit}
                />
            </InputContainer>
            <InputContainer>
                <Buttons>
                    {edit ? (
                        <>
                            <Button
                                variant="outlined"
                                color="success"
                                disabled={!adminsData || adminsData.length < 1}
                                onClick={async () => {
                                    await mutation.mutateAsync();
                                    setEdit(false);
                                }}
                                startIcon={<SaveIcon />}
                            >
                                {t("common:button.save")}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setAdminsData(admins ?? null);
                                    setEdit(false);
                                }}
                            >
                                {t("common:button.cancel")}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outlined" onClick={() => setEdit(true)} startIcon={<EditIcon />}>
                            {t("common:button.change")}
                        </Button>
                    )}
                </Buttons>
            </InputContainer>
        </>
    );
}
