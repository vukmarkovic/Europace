/**
 * Represents application initialization error page.
 * Should not appear ever. If user see it then something went sooo wrong...
 * Route: /init_error
 * @constructor
 */
export default function InitError() {
    return <div className="app container-fluid my-2">Bitrix24 failed to initialize</div>;
}
