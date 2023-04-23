import React from "react";
import { getKeys } from "../util/extensions";

/**
 * Checks whether required data presents.
 * @param required - required data
 * @param obj - object to check
 * @param stateSetter - state setter to update errors data.
 */
export const useValidate = <T extends Record<string, any>, O extends T>(required: T, obj: O, stateSetter?: React.Dispatch<React.SetStateAction<any>>) => {
    return () => {
        const errors = {} as any;
        getKeys(required).forEach(key => {
            errors[key] = !obj[key];
        });
        if (stateSetter) {
            stateSetter((prevState: any) => ({ ...prevState, ...errors }));
        }
        return Object.values(errors).every(x => !x);
    };
};
