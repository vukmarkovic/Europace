import IBxRobotAuth from './bx.robot.auth';

interface IBxRobotData {
    workflow_id: string;
    code: string;
    document_id: [entity: string, entityType: string, elementTypeId: string];
    document_type: string[];
    event_token: string;
    timeout_duration: string;
    ts: string;
    auth: IBxRobotAuth;
    //properties: { select: string };
}

export default IBxRobotData;
