import { LinearProgress } from "@mui/material";
import classes from "./index.module.css";
import { PropsWithChildren, useEffect, useState } from "react";
import classNames from "classnames";
import { useIsFetching, useIsMutating } from "react-query";

interface IProps {
    inProgress?: boolean;
}

/**
 * Loading indicator component.
 * Appears at the top of the page.
 * Used when async operation in progress to notify user.
 * @param inProgress - force loading state.
 * @param children - content that may produce async operations.
 * @see https://react-query-v3.tanstack.com/reference/useIsFetching
 * @see https://react-query-v3.tanstack.com/reference/useIsMutating
 * @constructor
 */
export default function ProgressWrapper({ inProgress, children }: PropsWithChildren<IProps>) {
    const [loading, setLoading] = useState(false);
    const isFetching = useIsFetching();
    const isMutating = useIsMutating();

    useEffect(() => {
        setLoading(isFetching > 0 || isMutating > 0);
    }, [isFetching, isMutating]);

    return (
        <>
            <div className={classes.progressWrapper}>
                <LinearProgress
                    className={classNames({
                        [classes.hidden]: !inProgress && !loading,
                    })}
                />
            </div>
            <div
                className={classNames({
                    [classes.inProgress]: inProgress || loading,
                })}
            >
                {children}
            </div>
        </>
    );
}
