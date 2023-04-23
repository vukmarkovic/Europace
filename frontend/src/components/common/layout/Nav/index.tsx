import { NavLink } from "react-router-dom";
import React from "react";
import { useTranslation } from "react-i18next";
import classes from "./index.module.css";
import classNames from "classnames";
import { Link, Stack } from "@mui/material";
import nav from "../../../../router/nav";

interface IProps {
    placement: string;
}

/**
 * Main application navigation component.
 * Providing stack of navigation links.
 * @param placement - current application placement.
 * @see routes
 * @see nav
 * @see https://dev.1c-bitrix.ru/rest_help/application_embedding/index.php
 * @constructor
 */
export default function Nav({ placement }: IProps) {
    const { t } = useTranslation("common");
    const links = nav(placement) ?? [];

    return (
        <>
            {links.length > 1 && (
                <nav>
                    <Stack spacing={1} direction="row">
                        {links.map(item => (
                            <NavLink to={item.to} className={({ isActive }) => classNames({ [classes.activeNav]: isActive, [classes.navLink]: true })}>
                                <Link underline="none">{t(item.label)}</Link>
                            </NavLink>
                        ))}
                    </Stack>
                </nav>
            )}
        </>
    );
}
