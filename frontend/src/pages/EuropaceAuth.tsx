import { Initialization, Page } from "../components/common/layout";
import BXApiService from "../bxapi/service/bx.api.service";
import EuropaceService from "../api/service/europace.service";
import { useEffect } from "react";

/**
 * Europace authorization redirect page.
 * Route: /europace
 *
 * Initiates a redirect to the Europace personal account in a new window,
 * otherwise it will show information about failed authorization.
 *
 * - loading circle
 * @see Initialization
 * @constructor
 */

export default function EuropaceAuth() {
    const ENTITY_ID = BXApiService.placementInfo.options.ENTITY_ID;
    const SP_ID = BXApiService.placement.split("_")[2];
    const access_token = BXApiService.authData.access_token

    const getUrl = async () => {
        try {
            const url = await EuropaceService.getUrl(SP_ID, ENTITY_ID, access_token);
            window.open(url, "_blank", "noopener,noreferrer");
            BXApiService.closeApplication();
        } catch (e: any) {
            console.error(e);
            window.alert(e.response?.data?.message);
            BXApiService.closeApplication();
        }
    };

    useEffect(() => {
        getUrl();
    }, []);

    return (
        <Page title="">
            <Initialization />
        </Page>
    );
}
