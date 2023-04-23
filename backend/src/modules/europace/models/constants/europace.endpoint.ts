/**
 * Europace API endpoints.
 */
const ENDPOINTS = {
    TOKEN: ':host/auth/token',
    SILENT_SIGN_IN: 'https://www.europace2.de/authorize/silent-sign-in?subject=:subject',
    AUTH_REDIRECT: 'https://www.europace2.de/authorize/silent-sign-in?subject=:subject&redirect_uri=/vorgang/oeffne/:id&otp=:otp',
    CASE_CREATE: 'https://baufinanzierung.api.europace.de/kundenangaben',
    CASE_REPLACE: 'https://baufinanzierung.api.europace.de/kundenangaben/:id',
    CASE_GET: 'https://baufinanzierung.api.europace.de/kundenangaben/:id',
    SET_EDITOR: 'https://api.europace2.de/v2/vorgaenge/:id/vorgangsBearbeiter'
};

export default ENDPOINTS;
