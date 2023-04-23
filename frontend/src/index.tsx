import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./util/i18n";
import { Initialization } from "./components/common/layout";
import { SnackbarProvider } from "notistack";

/**
 * Main application start script
 */
ReactDOM.render(
    <React.StrictMode>
        <React.Suspense fallback={<Initialization />}>
            <SnackbarProvider anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <App />
            </SnackbarProvider>
        </React.Suspense>
    </React.StrictMode>,
    document.getElementById("root")
);

reportWebVitals();
