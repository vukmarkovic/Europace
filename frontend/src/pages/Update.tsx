import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Initialization } from "../components/common/layout";
import BXApiService from "../bxapi/service/bx.api.service";
import AppApiService from "../api/service/app.api.service";

/**
 * Represents update application page.
 * Route: /update/:version
 * where `version` is current version of installed application.
 * Executes update request to backend API, then navigates to main page.
 * If `version` === 0 installs application.
 * @see AppApiService
 * @see BXApiService.install
 * @constructor
 */
export default function Update() {
    const { version } = useParams();
    const [error, setError]: [unknown, any] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function doUpdate() {
            try {
                const response = await AppApiService.post<number>(`update`, {
                    version,
                    ...BXApiService.authData,
                });
                await BXApiService.setAppVersion(response.data);
                if (version === "0") {
                    await BXApiService.install();
                } else {
                    navigate("/", { replace: true });
                }
            } catch (e) {
                setError(e); //todo
            }
        }

        (async () => doUpdate())();
    }, []);

    if (!BXApiService.isAdmin) {
        return <div>not admin //TODO</div>;
    }

    return error ? (
        <div className="app container-fluid my-2">
            <div className="text-center">{String(error)}</div>
        </div>
    ) : (
        <Initialization />
    );
}
