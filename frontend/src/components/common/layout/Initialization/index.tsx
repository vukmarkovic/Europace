import classes from "./index.module.css";
import { CircularProgress, Typography } from "@mui/material";

/**
 * Loading spinner component.
 * Used as page stub while content is loading from backend.
 * @param message - message to show while loading (optional).
 * @constructor
 */
export default function Initialization({ message }: { message?: string }) {
    return (
        <div className={classes.wrapper}>
            {message && <Typography variant="h5">{message}</Typography>}
            <CircularProgress size="7rem" />
        </div>
    );
}
