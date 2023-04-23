import { Grid, Stack } from "@mui/material";
import { PropsWithChildren } from "react";

/**
 * Container for stack of buttons.
 * @param children - buttons.
 * @constructor
 */
export default function Buttons({ children }: PropsWithChildren<unknown>) {
    return (
        <Grid container>
            <Grid item>
                <Stack spacing={2} direction="row">
                    {children}
                </Stack>
            </Grid>
        </Grid>
    );
}
