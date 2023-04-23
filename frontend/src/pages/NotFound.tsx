import { Box, Typography } from "@mui/material";

/**
 * Represents not found error page.
 * Appears if route or requested data not found.
 * @constructor
 */
export default function NotFound() {
    return (
        <Box>
            <Typography variant={"h1"}>404 Not found</Typography>
        </Box>
    );
}
