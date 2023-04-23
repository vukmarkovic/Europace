import { TaskType } from '../types/task.type';
import { TaskInterval } from '../types/task.interval';
import { Task } from '../entities/task.entity';

export default class TaskDto {
    id?: number;
    type: TaskType;
    intervalType: TaskInterval;
    interval: number;
    startDate?: Date;
    lastRunDate?: Date;

    constructor(task: Task) {
        TaskDto.init(task, this);
    }

    private static init(src: Task, dest: TaskDto) {
        if (!src) return;

        dest.id = src.id;
        dest.type = src.type;
        dest.intervalType = src.intervalType;
        dest.interval = src.interval;
        dest.startDate = src.startDate;
        dest.lastRunDate = src.lastRunDate;
    }
}
