import {useTranslation} from "react-i18next";
import {useState} from "react";
import {Box, Button, Typography} from "@mui/material";
import { InputContainer } from "../../common/ui";
import { AsyncSelect } from "../../common/ui";
import SaveIcon from "@mui/icons-material/Save";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Option from "../../common/ui/AsyncSelect/types/option";
import AutocompleteService from "../../../api/common/autocomplete.service";
import PlacementService from "../../../api/service/placement.service";
import { Buttons } from "../../common/layout";
import SettingsService from "../../../api/settings/settings.service";
import EditIcon from "@mui/icons-material/Edit";
/**
 * Placements manager component.
 * Part of settings page.
 * Provides read-write operataions.
 * @see PlacementService
 * @see Placement
 * @constructor
 */
export default function Placement() {
   const { t } = useTranslation(['settings', 'common']);
   const [edit, setEdit] = useState(false);
   const queryClient = useQueryClient();

   const { data: placements } = useQuery<Option[] | null>('placements', SettingsService.listPlacements, {
      onSuccess: placements => {
         setPlacementData(placements)
      },
   });

   const [placementData, setPlacementData] = useState<Option[] | null>(placements ?? null);


   const mutationPlacements = useMutation(() => PlacementService.setPlacement(placementData?.map(x => x.value) || []), {
      onSuccess: () => {
        queryClient.setQueryData("placements", placementData);
        SettingsService.updatePlacements(placementData);
      },
      onError: () => {
        queryClient.setQueryData("placements", placements);
      },
  });

   return (
         <>
            <Box sx={{ display: 'flex' }} mb={2}>
               <Typography variant="h5">{t('settings:placement.title')}</Typography>
            </Box>
            <InputContainer>
               <AsyncSelect
                   value={placementData}
                   onChange={(selected: Option[] | null) => {
                       setPlacementData(selected);
                   }}
                   options={AutocompleteService.processSearch}
                   required
                   label={t("settings:placement.process")}
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
                               onClick={async () => {
                                   await mutationPlacements.mutateAsync();
                                   setEdit(false);
                               }}
                               startIcon={<SaveIcon />}
                           >
                               {t("common:button.save")}
                           </Button>
                           <Button
                               variant="outlined"
                               onClick={() => {
                                   setPlacementData(placements ?? null);
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
   )
}