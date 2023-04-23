import ColumnConfig from "../../types/column.config";
import { useTranslation } from "react-i18next";
import { Tooltip, Typography } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { valueTypeAddress, valueTypeEmail, valueTypeIm, valueTypeWeb } from "../../data/valuetype";
import Stack from "@mui/material/Stack";
import { useContext, useEffect, useState } from "react";
import EntityType from "../../enum/entity.type";
import SelectValue from "../SelectValue";
import SelectOption from "../../interfaces/select.option";
import SelectControl from "../SelectControl";
import { MatchingContext } from "../../context/matching.context";
import { getFieldOptions } from "./util";
import { useSelectProps } from "../../hooks/select.props";
import useChangeHandler from "../../hooks/select.change.callback";
import PhoneField from "./phone.field";
import CustomField from "./custom.field";
import { useQuery } from "react-query";
import LoadService from "../../service/load.service";
import HelpIcon from "@mui/icons-material/Help";
import cl from "./index.module.css";
import AutocompleteSelect from "../AutocompleteSelect";
import BiggerTooltip from "../BiggerTooltip";

interface IProps {
    field: string;
    item: ColumnConfig;
}

/**
 * Matching field configuration component.
 * Provides external API to Bitrix24 API field matching with given configuration.
 * Loads fields, linked entities and default values.
 * Provides additional info configuration.
 * @param field - matching field name
 * @param item - current matching field configuration
 * @param contractItem - base matching field configuration
 * @see PhoneField
 * @see CustomField
 * @constructor
 */
export default function FieldItem({ field, item }: IProps) {
    const { t } = useTranslation();
    const selectProps = useSelectProps(field, item);
    const changeHandler = useChangeHandler();

    const { contractItem, config, bxMethodHandler } = useContext(MatchingContext);

    const entityOptions = config.map(e => {
        return { value: `${e}`, text: t(`MatchingInterface:entity-${e}`) };
    });
    if (!item.isContract) {
        entityOptions.splice(0, 0, { value: "None", text: t("MatchingInterface:entity-None") });
    }

    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
    const [childOptions, setChildOptions] = useState<SelectOption[]>([]);

    const { data: fields } = useQuery(["fields", item.bitrix?.entity, item.bitrix?.smartProcessId ?? item.bitrix?.listId], () =>
        LoadService.loadFields(bxMethodHandler, item.bitrix?.entity, item.bitrix?.smartProcessId ?? item.bitrix?.listId)
    );
    const { data: childFields } = useQuery(["fields", item.bitrix?.childType, item.bitrix?.childId], () =>
        LoadService.loadFields(bxMethodHandler, item.bitrix?.childType, item.bitrix?.childId)
    );
    const { data: smartProcesses } = useQuery("smartProcesses", () => LoadService.loadSP(bxMethodHandler), {
        enabled: item.bitrix?.entity === EntityType.SMART_PROCESS,
    });
    const { data: lists } = useQuery("lists", () => LoadService.loadLists(bxMethodHandler), {
        enabled: item.bitrix?.entity === EntityType.LIST || !!item.bitrix?.smartProcessId,
    });

    useEffect(() => {
        if (!fields) {
            setSelectOptions([]);
        } else {
            setSelectOptions(getFieldOptions(fields, item.bitrixTypes));
        }
    }, [fields]);

    useEffect(() => {
        if (!childFields) {
            setChildOptions([]);
        } else {
            setChildOptions(getFieldOptions(childFields, item.bitrixTypes));
        }
    }, [childFields]);

    return (
        <Stack direction="row" spacing={2} marginBottom={2}>
            <div style={{ display: "flex", alignItems: "center" }}>
                {item.isContract ? (
                    <div style={{ width: 220, textAlign: "center" }}>
                        <Typography variant="h6">{t(`MatchingInterface:tab-title-${field}`)}</Typography>
                    </div>
                ) : (
                    <>
                        <BiggerTooltip title={`${field} (${item.type})`} placement="top-start">
                            <span style={{ display: "block" }}>
                                <SelectControl
                                    label={t("MatchingInterface:title")}
                                    value="1"
                                    disabled={true}
                                    noValueHighlight={true}
                                    items={[{ value: "1", text: field }]}
                                />
                                {item.hint && (
                                    <Tooltip title={t("MatchingInterface:hint." + item.hint) as string} placement="top-end">
                                        <HelpIcon className={cl.helpIcon} color="primary" />
                                    </Tooltip>
                                )}
                            </span>
                        </BiggerTooltip>
                    </>
                )}
            </div>
            <div>
                <SelectValue items={entityOptions} readonly={item.isContract ?? false} {...selectProps("bitrixEntity", "entity")} />
            </div>
            {EntityType.SMART_PROCESS === item.bitrix.entity && smartProcesses && (
                <div>
                    <SelectControl
                        label={t("MatchingInterface:smartProcess")}
                        value={item.bitrix.smartProcessId ? item.bitrix.smartProcessId.toString() : ""}
                        items={smartProcesses!.map(sp => ({
                            value: sp.entityTypeId.toString(),
                            text: sp.title,
                        }))}
                        onChange={(e: SelectChangeEvent) => {
                            changeHandler(field, "smartProcessId", parseInt(e.target.value));
                        }}
                        disabled={EntityType.SMART_PROCESS === contractItem?.bitrix.entity && !item.isContract}
                    />
                </div>
            )}

            {!item.isContract && selectOptions.length > 0 && (
                <>
                    <div>
                        <SelectValue items={selectOptions} {...selectProps("bitrixEntityField")} />
                    </div>
                </>
            )}
            {childOptions.length > 0 && (
                <>
                    <div>
                        <SelectValue items={childOptions} {...selectProps("bitrixChildEntityField", "childName")} />
                    </div>
                </>
            )}

            <PhoneField field={field} item={item} />
            <CustomField name="email" valueTypes={valueTypeEmail} field={field} item={item} />
            <CustomField name="web" valueTypes={valueTypeWeb} field={field} item={item} />
            <CustomField name="IM" valueTypes={valueTypeIm} field={field} item={item} />
            <CustomField name="address" valueTypes={valueTypeAddress} field={field} item={item} />

            {!item.isContract &&
                (item.linkType ||
                    item.bitrix?.childId ||
                    (item.bitrix?.entity && contractItem?.bitrix?.entity && item.bitrix.entity !== contractItem.bitrix.entity)) && (
                    <AutocompleteSelect
                        entity={item.linkType || (item.bitrix?.childType ?? item.bitrix.entity!)}
                        parentId={item.bitrix?.childId}
                        {...selectProps("defaultValue", "defaultValue")}
                        value={
                            item.bitrix?.defaultValue
                                ? {
                                      value: item.bitrix.defaultValue!,
                                      text: item.bitrix.defaultView ?? "None",
                                  }
                                : null
                        }
                    />
                )}
        </Stack>
    );
}
