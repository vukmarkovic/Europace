import TaskType from "../enums/task.type";
import TaskInterval from "../enums/task.interval";

/**
 * DTO class representing received or sent task configuration data
 */
export default class Task {
    id?: number;
    type: TaskType;
    intervalType: TaskInterval;
    interval: number;
    startDate: Date | null;
    lastRunDate?: Date;

    constructor(data: any) {
        this.id = data.id;
        this.type = data.type;
        this.intervalType = data.intervalType ?? TaskInterval.NONE;
        this.interval = data.interval ?? 0;
        this.startDate = data.startDate ? new Date(data.startDate) : null;
        this.lastRunDate = data.lastRunDate ? new Date(data.lastRunDate) : undefined;
    }
}
