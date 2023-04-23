import BXApiService from "../../bxapi/service/bx.api.service";
import BxUser from "../../bxapi/model/bx.user";
import Robot from "../../models/interfaces/robot";
import AppApiService from "../service/app.api.service";
import Option from "../../components/common/ui/AsyncSelect/types/option";
import RobotError from "../../models/exceptions/robot.error";
import BxPlacement from "../../bxapi/model/bx.placement";

/**
 * Service providing read-write operations for client's portal settings:
 * - Bitrix24 robots;
 * - any other settings by key.
 *
 * Also provides Bitrix24 API auth data operations.
 * Uses:
 * - bitrix service;
 * - backend API.
 *
 * @see BXApiService
 * @see AppApiService
 */
class SettingsServiceImpl {
    /**
     * Gets client's settings value by key.
     * @param key - settings name.
     * @returns any - settings value.
     * @see AppApiService
     */
    async get<T>(key: string): Promise<T> {
        return (await AppApiService.get<T>(`settings/byKey/${key}`)).data;
    }

    /**
     * Updates client's settings value by key.
     * @param key - settings key.
     * @param data - new value.
     * @see AppApiService
     */
    async update(key: string, data: any) {
        await AppApiService.put(`settings/byKey/${key}`, { value: data });
    }

    /**
     * Gets user used to call Bitrix24 rest API.
     * @returns BxUser - current user.
     * @see AppApiService
     * @see BxUser
     */
    async getCurrentAuth() {
        return new BxUser((await AppApiService.get(`bx/auth`)).data);
    }

    /**
     * Updates authentication data with current user.
     * @returns BxUser - new user used to call Bitrix24 rest API.
     * @see AppApiService
     * @see BXApiService
     * @see BxUser
     */
    async updateAuth() {
        return new BxUser((await AppApiService.post(`bx/auth`, BXApiService.authData)).data);
    }

    /**
     * Returns all registered robots.
     * @returns string[] - robot codes.
     * @see BXApiService
     * @see https://dev.1c-bitrix.ru/rest_help/bizproc/bizproc_robot/bizproc_robot_list.php
     */
    async getRobots(): Promise<string[]> {
        return await BXApiService.callMethod("bizproc.robot.list", {});
    }

    /**
     * Removes robot is exists or registers new one if not.
     * @param robot - robot data.
     * @param robotSet - whether robot is registered.
     * @see removeRobot
     * @see addRobot
     */
    async updateRobotState(robot: Robot, robotSet: boolean) {
        return robotSet ? this.removeRobot(robot) : this.addRobot([robot]);
    }

    /**
     * Registers robots.
     * @param robots - robots data.
     * @returns any Bitrix24 rest API batch call result.
     * @throws { code: string } if any robot register failed.
     * NOTE: successfully registered robots stay registered.
     * @see BXApiService.callBatch
     * @see https://dev.1c-bitrix.ru/rest_help/bizproc/bizproc_robot/bizproc_robot_add.php
     */
    async addRobot(robots: Robot[]) {
        if (robots.length < 1) return;

        const result = await BXApiService.callBatch(
            robots.map(robot => ({
                id: "add_" + robot.CODE,
                method: "bizproc.robot.add",
                data: robot,
            }))
        );

        if (Object.values(result).find((r: any) => !r.data)) {
            throw new RobotError("robotUpdateFailed");
        }

        return result;
    }

    /**
     * Removes robot.
     * @param robot - robot data.
     * @returns true - robot removed.
     * @throws { code: string } if robot remove failed.
     * @see BXApiService.callMethod
     * @see https://dev.1c-bitrix.ru/rest_help/bizproc/bizproc_robot/bizproc_robot_delete.php
     */
    async removeRobot(robot: Robot) {
        if (!(await BXApiService.callMethod("bizproc.robot.delete", { CODE: robot.CODE }))) {
            throw new RobotError("robotUpdateFailed");
        }
        return true;
    }

    async listAdmins(): Promise<Option[] | null> {
        const data = await SettingsService.get<string>("admins");
        if (!data) return [];

        const ids = String(data).split(";");
        if (!ids.length) {
            return [];
        }

        const usersResponse = await BXApiService.callMethod("user.get", {
            FILTER: {
                ID: ids,
            },
        });
        const users: BxUser[] = usersResponse.map((x: any) => {
            return new BxUser(x);
        });

        return users.map<Option>(x => {
            return {
                label: [x.LAST_NAME, x.NAME, x.SECOND_NAME].filter(s => !!s).join(" ") || (x.EMAIL ?? ""),
                value: x.ID ?? "",
            };
        });
    }

    async updateAdmins(data: Option[] | null) {
        if (!data) return false;
        await SettingsService.update("admins", data.map(x => x.value).join(";"));
    }

    async listPlacements(): Promise<Option[] | null> {
        const data = await SettingsService.get<string>("placements");
        if (!data) return [];

        const ids = String(data).split(";");
        if (!ids.length) {
            return [];
        }
        const placementsResponse = (await BXApiService.callMethod("crm.type.list", {
            filter: {
                entityTypeId: ids,
            },
        })).types;
        const placements: BxPlacement[] = placementsResponse.map((x: any) => {
            return new BxPlacement(x);
        });
        return placements.map<Option>(x => {
            return {
                label: x.title,
                value: x.entityTypeId,
            };
        });
    }

    async updatePlacements(data: Option[] | null) {
        if (!data) return false;
        await SettingsService.update("placements", data.map(x => x.value).join(";"));
    }
}

const SettingsService = new SettingsServiceImpl();
export default SettingsService;
