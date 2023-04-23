import { useTranslation } from "react-i18next";
import Column from "../../types/column";
import React, { useState } from "react";
import EntityType from "../../enum/entity.type";
import { Box, Tab, Tabs } from "@mui/material";
import { MatchingContext } from "../../context/matching.context";
import CallMethodHandler from "../../interfaces/call.method.handler";
import MatchingTab from "../MatchingTab";
import ColumnConfig from "../../types/column.config";
import { DefaultOptions, QueryClient, QueryClientProvider, useQueryClient } from "react-query";
import queryCache from "./query.cache";

interface IProps {
    configs: Record<string, EntityType[]>;
    loadHandler: (entityType: string) => Promise<Column>;
    saveHandler: (entity: string, items: Column) => Promise<any>;
    bxMethodHandler: CallMethodHandler;
    buttonTitle?: string;
}

/**
 * Matching interface manager component.
 * Provides tabs with configurable fields.
 * Uses own query client and cache.
 * @param configs - matching entities configuration.
 * @param loadHandler - load matching configuration handler.
 * @param saveHandler - save matching configuration handler.
 * @param bxMethodHandler - Bitrix24 API call handler.
 * @param buttonTitle - save button localized text.
 * @see https://react-query-v3.tanstack.com/reference/QueryClient
 * @see https://react-query-v3.tanstack.com/guides/caching
 * @constructor
 */
export default function MatchingInterface({ configs, loadHandler, saveHandler, bxMethodHandler, buttonTitle }: IProps) {
    const { t } = useTranslation();

    const tabs = Object.keys(configs);
    const [activeTab, setActiveTab] = useState(0);
    const [config, setConfig] = useState(configs[tabs[0]]);
    const [items, setItems] = useState<Column>({});
    const [contractItem, setContractItem] = useState<ColumnConfig | null>(null);

    const defaultOptions: DefaultOptions = {
        queries: {
            refetchOnWindowFocus: "always",
            refetchOnReconnect: false,
            refetchOnMount: false,
            keepPreviousData: true,
            staleTime: Infinity,
        },
    };
    const queryClient = new QueryClient({
        defaultOptions,
        queryCache: queryCache,
    });

    try {
        const appClient = useQueryClient();
        const appOptions = appClient.getDefaultOptions();
        queryClient.setDefaultOptions({
            queries: {
                ...appOptions.queries,
                ...defaultOptions.queries,
            },
            mutations: appOptions.mutations,
        });
    } catch (e) {
        // app's not using react-qery, so it's fine then
    }

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={(event: any, val: number) => setActiveTab(val)} variant="scrollable" scrollButtons>
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={t(`MatchingInterface:tab-title-${tab}`)} />
                    ))}
                </Tabs>
            </Box>
            <QueryClientProvider client={queryClient} contextSharing={true}>
                <MatchingContext.Provider
                    value={{
                        configs,
                        config,
                        setConfig,
                        items,
                        setItems,
                        contractItem,
                        setContractItem,
                        loadHandler,
                        saveHandler,
                        bxMethodHandler,
                    }}
                >
                    <MatchingTab entity={tabs[activeTab]} buttonTitle={buttonTitle} />
                </MatchingContext.Provider>
            </QueryClientProvider>
        </>
    );
}
