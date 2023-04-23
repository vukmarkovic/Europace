import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { Autocomplete, CircularProgress, debounce, TextField } from "@mui/material";
import SelectOption from "../../interfaces/select.option";
import useChangeHandler from "../../hooks/select.change.callback";
import EntityType from "../../enum/entity.type";
import ColumnBitrixConfig from "../../types/column.bitrix.config";
import AutocompleteService from "../../service/autocomplete.service";
import { MatchingContext } from "../../context/matching.context";
import "./index.css";

type IProps = {
    /**
     * select label localized text
     */
    label: string;
    /**
     * current value
     */
    value: SelectOption | null;
    /**
     * Bitrix24 API entity type
     */
    entity: EntityType;
    /**
     * matching field name
     */
    field: string;
    /**
     * parent identifier (optional0, used for smart processes, lists and linked entities
     */
    parentId?: string | number | null;
    changeHandler: (field: string, key: keyof ColumnBitrixConfig, value: string | number | string[] | null) => void;
};

/**
 * Custom async select list element component.
 * Select options loading from Bitrix24 API by input term.
 * @param props - component props.
 * @see https://mui.com/material-ui/react-autocomplete/
 * @constructor
 */
export default function AutocompleteSelect({ label, value, entity, field, parentId }: PropsWithChildren<IProps>) {
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<readonly SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    const changeHandler = useChangeHandler();

    const { bxMethodHandler } = useContext(MatchingContext);

    const getOptionsDelayed = useCallback(
        debounce((text, callback) => {
            setOptions([]);
            AutocompleteService.search(text, entity, bxMethodHandler, parentId).then(callback);
        }, 400),
        [parentId]
    );

    useEffect(() => {
        let active = true;

        setLoading(true);
        getOptionsDelayed(inputValue, (data: SelectOption[]) => {
            if (active) {
                setOptions(data);
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [inputValue]);

    return (
        <div className={"DefaultValue"}>
            <Autocomplete
                autoComplete
                value={value ?? null}
                filterOptions={x => x}
                includeInputInList
                onChange={(e: React.SyntheticEvent, newValue: SelectOption | null) => {
                    changeHandler(field, "defaultValue", newValue ? JSON.stringify(newValue) : null);
                }}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                isOptionEqualToValue={(option, selectValue) => option.value === selectValue.value}
                getOptionLabel={option => option.text}
                options={options}
                loading={loading}
                renderInput={params => (
                    <TextField
                        {...params}
                        value={value?.text}
                        label={label}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )}
            />
        </div>
    );
}
