import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Box, FormControl, Grid, MenuItem, Select, Typography, Button, SelectChangeEvent, OutlinedInput, TextField } from "@mui/material";
import { DateTimePicker, LoadingButton } from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { getKeys } from "../../../util/extensions";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import ruLocale from "date-fns/locale/ru";
import Task from "../../../models/dto/task";
import TaskService from "../../../api/tasks/task.service";
import TaskInterval from "../../../models/enums/task.interval";
import { InputContainer } from "../../common/ui";
import { Buttons } from "../../common/layout";
import { useMutation, useQueryClient } from "react-query";

interface IProps {
    task: Task;
}

/**
 * Task configuration component.
 *
 * Provides:
 * - task settings;
 * - immediately task execution;
 * @param task - current task configuration
 * @see Task
 * @see TaskService
 * @constructor
 */
export default function TaskItem({ task }: IProps) {
    const { t } = useTranslation(["common", "settings", "error"]);
    const [edit, setEdit] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [taskData, setTaskData] = useState(task);

    const queryClient = useQueryClient();
    const mutation = useMutation(() => TaskService.save(taskData), {
        onSuccess: id => {
            const tasks = Object.fromEntries(queryClient.getQueryData<Task[]>("tasks")!.map(task => [task.type, task]));
            queryClient.setQueryData("tasks", Object.values({ ...tasks, [taskData.type]: { ...taskData, id } }));
        },
    });

    const save = async () => {
        await mutation.mutateAsync();
        setEdit(false);
    };

    const execute = useMutation(
        async () => {
            setExecuting(true);
            await TaskService.execute(task.type);
            return true;
        },
        {
            onSettled: () => setExecuting(false),
        }
    );

    const typeChange = (e: SelectChangeEvent) => setTaskData(data => ({ ...data, intervalType: TaskInterval[e.target.value as keyof typeof TaskInterval] }));

    return (
        <Box mb={4}>
            <Box sx={{ display: "flex" }} mb={2}>
                <Typography variant="h6">{t(`settings:task.${task.type}`)}</Typography>
            </Box>
            {task.lastRunDate && <InputContainer>{task.lastRunDate.toLocaleString()}</InputContainer>}
            <Grid container mb={3} lg={9} xl={7}>
                <Grid item xs={4}>
                    <FormControl fullWidth hiddenLabel>
                        <Select value={taskData.intervalType} disabled={!edit} onChange={typeChange}>
                            {getKeys(TaskInterval).map(x => (
                                <MenuItem key={x} value={x}>
                                    {t(`settings:task.interval.${x}`)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2} sx={{ pl: 2 }}>
                    {taskData.intervalType !== TaskInterval.NONE && (
                        <FormControl fullWidth hiddenLabel>
                            <OutlinedInput
                                type={"number"}
                                value={taskData.interval}
                                onChange={e => setTaskData(data => ({ ...data, interval: Number(e.target.value) }))}
                                disabled={!edit}
                            />
                        </FormControl>
                    )}
                </Grid>
                <Grid item xs={4} sx={{ pl: 2 }}>
                    {taskData.intervalType !== TaskInterval.NONE && (
                        <FormControl fullWidth hiddenLabel>
                            <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
                                <DateTimePicker
                                    renderInput={(params: any )=> <TextField {...params} />}
                                    value={taskData.startDate}
                                    onChange={(val: any) => setTaskData(data => ({ ...data, startDate: val }))}
                                    disabled={!edit}
                                    minDateTime={new Date()}
                                    mask="__.__.____ __:__"
                                    inputFormat="dd.MM.yyyy HH:mm"
                                    label={t("settings:task.startDate")}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    )}
                </Grid>
            </Grid>
            <Buttons>
                {edit ? (
                    <>
                        <Button variant="outlined" color="success" onClick={save} disabled={!edit} startIcon={<SaveIcon />}>
                            {t("common:button.save")}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setEdit(false);
                                setTaskData(task);
                            }}
                            startIcon={<CloseIcon />}
                        >
                            {t("common:button.cancel")}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outlined" onClick={() => setEdit(true)} startIcon={<EditIcon />}>
                            {t("common:button.change")}
                        </Button>
                        <LoadingButton sx={{ ml: 2 }} variant="outlined" color="success" onClick={() => execute.mutateAsync()} loading={executing}>
                            {t("common:button.execute")}
                        </LoadingButton>
                    </>
                )}
            </Buttons>
        </Box>
    );
}
