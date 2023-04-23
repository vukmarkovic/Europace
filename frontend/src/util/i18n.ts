import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import BXApiService from "../bxapi/service/bx.api.service";

/**
 * Language detector.
 * Uses BX24 js library to get current portal locale.
 * @see BXApiService.locale
 */
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
    name: "bxDetector",
    lookup() {
        return BXApiService.locale;
    },
});

/**
 * Localization react module.
 * Requests locale files from /locales folder on the server.
 * Uses language detector.
 * Uses fallback to en-US.
 * @see Backend
 * @see LanguageDetector
 */
i18n.use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(languageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        fallbackLng: "en-US",
        defaultNS: "home",
        debug: process.env.REACT_APP_DEBUG === "true",
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        detection: {
            order: ["bxDetector"],
        },
    });

export default i18n;
