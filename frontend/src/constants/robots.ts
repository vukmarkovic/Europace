import Robot from "../models/interfaces/robot";

/**
 * Bitrix24 robot data in rest API call format.
 * @see https://dev.1c-bitrix.ru/rest_help/bizproc/bizproc_robot/bizproc_robot_add.php
 */
const ROBOTS: Record<string, Robot> = {
    EUROPACE_CASE_PUT: {
        CODE: "EUROPACE_CASE_PUT",
        NAME: "[Europace]: Create/replace case",
        HANDLER: `${process.env.REACT_APP_URL}robot/case-put`,
    },
    EUROPACE_CASE_GET: {
        CODE: "EUROPACE_CASE_GET",
        NAME: "[Europace]: Get case",
        HANDLER: `${process.env.REACT_APP_URL}robot/case-get`,
    },
};

export default ROBOTS;
