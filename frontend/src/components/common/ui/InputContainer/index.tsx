import React, { PropsWithChildren } from "react";
import { Grid } from "@mui/material";

interface IProps {
    inModal?: boolean;
}

/**
 * Container for input field.
 * Has two appearance variants:
 * - on page directly;
 * - on modal dialog layout.
 * @param props
 * @constructor
 */
export default function InputContainer(props: PropsWithChildren<IProps>) {
    if (props.inModal) {
        return (
            <Grid container mb={3}>
                <Grid item xs={12}>
                    {props.children}
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container mb={3}>
            <Grid item xs={12} md={7} lg={6} xl={4}>
                {props.children}
            </Grid>
        </Grid>
    );
}
