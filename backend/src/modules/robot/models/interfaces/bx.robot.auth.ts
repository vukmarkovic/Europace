interface IBxRobotAuth {
    domain: string;
    client_endpoint: string;
    server_endpoint: string;
    member_id: string;
    application_token: string;
    access_token?: string
}

export default IBxRobotAuth;
