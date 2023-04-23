import React from "react";
import { TextField } from "@mui/material";

interface IProps {
    name?: string;
    value: string;
    label: string;
    required?: boolean;
    disabled?: boolean;
    error?: boolean;
    onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void;
}

/**
 * Customized input element component.
 * @see https://mui.com/material-ui/react-text-field/
 */
const TextInput = React.forwardRef<HTMLDivElement, IProps>((props, ref) => {
    return <TextField ref={ref} variant="outlined" fullWidth {...props} />;
});

export default TextInput;
