import TaskItem from "../TaskItem";
import { Initialization } from "../../common/layout";
import Task from "../../../models/dto/task";
import { useQuery } from "react-query";
import TaskService from "../../../api/tasks/task.service";

/**
 * Container for list of task configuration components.
 * Requests existing configurations from backend API.
 * Shows loader while fetching.
 * @see TaskService
 * @see TaskItem
 * @see Initialization
 * @constructor
 */
export default function TaskList() {
    const { data: tasks } = useQuery<Task[]>("tasks", TaskService.list);

    return tasks ? (
        <>
            {tasks.map(task => (
                <TaskItem task={task} />
            ))}
        </>
    ) : (
        <Initialization />
    );
}
