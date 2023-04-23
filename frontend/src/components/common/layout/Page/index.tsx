import React, { PropsWithChildren } from "react";
import { Box, Typography } from "@mui/material";

interface IProps {
    title: string;
}

/**
 * Page layout container component.
 * @param title - page title.
 * @param children - page content.
 * @constructor
 */
export default function Page({ title, children }: PropsWithChildren<IProps>) {
    return (
        <>
            <Box sx={{ display: "flex" }} mb={2}>
                <Typography variant="h3">{title}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>{children}</Box>
        </>
    );
}
