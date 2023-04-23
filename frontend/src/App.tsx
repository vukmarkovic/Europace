import React, { lazy, useCallback } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Alert, Box } from "@mui/material";
import { Nav, ProgressWrapper } from "./components/common/layout";
import routes from "./router/routes";
import BXApiService from "./bxapi/service/bx.api.service";
import { QueryClientProvider } from "react-query";
import createQueryClient from "./query/query.client";
import ErrorHandler from "./util/error.handler";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
const Frame = lazy(() => import("./pages/frame/Frame"));

/**
 * Application container.
 * Mounts main application layout, query provider and router.
 * @see https://react-query-v3.tanstack.com/overview
 * @see https://reactrouter.com/docs/en/v6/getting-started/tutorial
 */
export default function App() {
    const link = BXApiService.placementInfo?.options?.link;
    const { t } = useTranslation("error");
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const queryClient = createQueryClient(
        useCallback((error: any) => {
            enqueueSnackbar("", {
                content: (
                    <Alert severity="error" onClose={() => closeSnackbar()}>
                        {t(ErrorHandler.handle(error), ErrorHandler.getParams(error))}
                    </Alert>
                ),
            });
        }, [])
    );

    const app = (
        <QueryClientProvider client={queryClient} contextSharing={true}>
            <BrowserRouter>
                <Box m={BXApiService.placement === "DEFAULT" && !BXApiService.placementInfo?.options.IFRAME ? 0 : 2}>
                    <ProgressWrapper>
                        {<Nav placement={BXApiService.placement} />}
                        <Routes>
                            {routes.map(item => (
                                <Route path={item.path} element={item.element} />
                            ))}
                        </Routes>
                    </ProgressWrapper>
                </Box>
            </BrowserRouter>
        </QueryClientProvider>
    );
    return !link ? app : <Frame link={link} />;
}
