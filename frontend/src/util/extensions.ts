/**
 * Typed Object.keys function override
 */
export const getKeys = Object.keys as <T extends Record<string, any>>(obj: T) => Array<keyof T>;
