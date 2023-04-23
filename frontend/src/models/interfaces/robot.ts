/**
 * Interface representing Bitrix24 API robot data.
 * @see https://dev.1c-bitrix.ru/rest_help/bizproc/bizproc_robot/bizproc_robot_add.php
 */
interface Robot {
    CODE: string;
    HANDLER: string;
    NAME: string;
}

export default Robot;
