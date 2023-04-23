import { Grid } from "@mui/material";
import { MatchingContext } from "../../context/matching.context";
import FieldList from "../FieldList";
import React, { useContext, useEffect } from "react";
import { useQuery } from "react-query";

interface IProps {
    entity: string;
    buttonTitle?: string;
}

/**
 * Matching interface manager entity tab component.
 * Provides list of field to configure.
 * @param entity - matching entity.
 * @param buttonTitle - save button localized text.
 * @constructor
 */
export default function MatchingTab({ entity, buttonTitle }: IProps) {
    const { configs, setConfig, items, setItems, loadHandler } = useContext(MatchingContext);
    const { data: columns } = useQuery(["column", entity], () => loadHandler(entity), { refetchOnWindowFocus: false });

    useEffect(() => {
        setConfig(configs[entity]);
    }, [entity]);

    useEffect(() => {
        if (columns) {
            setItems(columns);
        }
    }, [columns]);

    return (
        <Grid container mb={3}>
            <Grid item xs={12} md={7} lg={6} xl={4}>
                {items && <FieldList buttonTitle={buttonTitle} entity={entity} />}
            </Grid>
        </Grid>
    );
}
