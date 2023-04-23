import { lazy } from "react";
import { Navigate } from "react-router-dom";
import EuropaceAuth from "../pages/EuropaceAuth";

const Home = lazy(() => import("../pages/Home"));
const Update = lazy(() => import("../pages/Update"));
const Settings = lazy(() => import("../pages/Settings"));
const Tasks = lazy(() => import("../pages/Tasks"));
const Matching = lazy(() => import("../pages/Matching"));
const InitError = lazy(() => import("../pages/InitError"));
const NotFound = lazy(() => import("../pages/NotFound"));

/**
 * All available routes of application
 */
const routes = [
    { path: "/", element: <Home /> },
    { path: "/app", element: <Home /> },
    { path: "/europace", element: <EuropaceAuth /> },
    { path: "/update/:version", element: <Update /> },
    { path: "/settings", element: <Settings /> },
    { path: "/tasks", element: <Tasks /> },
    { path: "/matching", element: <Matching /> },
    { path: "/init_error", element: <InitError /> },
    { path: "/install", element: <Navigate to="/update/0" /> },
    { path: "*", element: <NotFound /> },
];

export default routes;
