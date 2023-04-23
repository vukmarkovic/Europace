import { useNavigate } from "react-router-dom";
import { Initialization } from "../components/common/layout";
import nav from "../router/nav";
import BXApiService from "../bxapi/service/bx.api.service";
import { useQuery } from "react-query";

/**
 * Represents main page.
 * Route: /
 * Initiates update or redirects to settings.
 * @see Update
 * @see Settings
 * @constructor
 */
export default function Home() {
    const VERSION = 1;
    const navigate = useNavigate();
    useQuery("current-version", async () => await BXApiService.getAppVersion(), {
        onSuccess: data => {
            if (VERSION > data) {
                navigate(`/update/${data}`);
            } else {
                navigate(nav(BXApiService.placement)[0]?.to ?? "/init_error");
            }
        },
    });

    return (
        <div className="app container-fluid my-2">
            <Initialization />
        </div>
    );
}
