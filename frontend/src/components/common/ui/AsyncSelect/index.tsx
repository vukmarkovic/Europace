import React, { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { Autocomplete, CircularProgress, debounce, TextField } from "@mui/material";
import Option from "./types/option";

type IProps = {
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: boolean;
    options: (text: string) => Promise<Option[]>;
};

interface IPropsSingle extends IProps {
    multiple?: false;
    value: Option | null;
    onChange: (selected: Option | null) => void;
}

interface IPropsMulti extends IProps {
    multiple: true;
    value: Option[] | null;
    onChange: (selected: Option[] | null) => void;
}

/**
 * Custom async select list element component.
 * Provides single and multiple select lists.
 * Select options loading from backend API by input term.
 * @param props
 * @see https://mui.com/material-ui/react-autocomplete/
 * @constructor
 */
export default function AsyncSelect(props: PropsWithChildren<IPropsSingle | IPropsMulti>) {
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<readonly Option[]>([]);
    const [loading, setLoading] = useState(false);

    const getOptionsDelayed = useCallback(
        debounce((text, callback) => {
            setOptions([]);
            props.options(text).then(callback);
        }, 400),
        []
    );

    useEffect(() => {
        let active = true;

        setLoading(true);
        getOptionsDelayed(inputValue, (data: Option[]) => {
            if (active) {
                setOptions(data);
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [inputValue]);

    const getValue = () => {
        if (props.value) {
            return props.value;
        }

        if (props.multiple) {
            return props.value ?? [];
        }

        return null;
    };

    return (
        <Autocomplete
            autoComplete
            value={getValue()}
            filterOptions={x => x}
            includeInputInList={!props.multiple}
            onChange={(event: React.SyntheticEvent, newValue: Option | Option[] | null) => {
                if (props.multiple && Array.isArray(newValue)) {
                    props.onChange(newValue);
                    return;
                }
                if (!props.multiple && !Array.isArray(newValue)) {
                    props.onChange(newValue);
                    return;
                }
                props.onChange(null);
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            isOptionEqualToValue={(option, selectValue) => option.value === selectValue.value}
            getOptionLabel={option => option.label}
            options={options}
            loading={loading}
            multiple={props.multiple}
            disabled={props.disabled}
            renderInput={params => (
                <TextField
                    {...params}
                    label={props.label}
                    required={props.required}
                    error={props.error}
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
    );
}
