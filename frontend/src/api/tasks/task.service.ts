import Task from "../../models/dto/task";
import TaskType from "../../models/enums/task.type";
import AppApiService from "../service/app.api.service";

/**
 * Service providing operations with cron tasks:
 * - list registered tasks;
 * - update task configuration;
 * - immediately task execution.
 *
 * Uses:
 * - backend API
 *
 * @see AppApiService
 */
class TaskServiceImpl {
    /**
     * Gets all registered tasks for client's portal.
     * @returns Task[] - task list.
     * @see Task
     * @see AppApiService
     */
    async list(): Promise<Task[]> {
        const response: Task[] = (await AppApiService.get<any[]>(`task`)).data.map((x: any) => new Task(x));
        const typeKeys = Object.keys(TaskType);
        const remote = Object.fromEntries(response.filter(x => typeKeys.includes(x.type)).map(t => [t.type, t]));
        const allTasks = { ...Object.fromEntries(typeKeys.map(type => [type, new Task({ type: type })])), ...remote };
        return Object.values(allTasks);
    }

    /**
     * Saves new task configuration.
     * @param task - task config.
     * @see Task
     * @see AppApiService
     */
    async save(task: Task): Promise<number> {
        return (await AppApiService.post<number>(`task`, task)).data;
    }

    /**
     * Queue task to execution.
     * @param type - task type to execute.
     * @see TaskType
     * @see AppApiService
     */
    async execute(type: TaskType): Promise<void> {
        await AppApiService.get(`task/${type}`);
    }
}

const TaskService = new TaskServiceImpl();
export default TaskService;
