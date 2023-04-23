import SelectOption from "../../interfaces/select.option";

/**
 * Bitrix24 API web types as select options
 * @see SelectOption
 * @see https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/multifield/multifield_fields.php
 */
export const valueTypeWeb: SelectOption[] = [
    {
        value: "WORK",
        text: "MatchingInterface:web-work",
    },
    {
        value: "HOME",
        text: "MatchingInterface:web-home",
    },
    {
        value: "FACEBOOK",
        text: "MatchingInterface:web-facebook",
    },
    {
        value: "VK",
        text: "MatchingInterface:web-vk",
    },
    {
        value: "LIVEJOURNAL",
        text: "MatchingInterface:web-livejournal",
    },
    {
        value: "TWITTER",
        text: "MatchingInterface:web-twitter",
    },
    {
        value: "OTHER",
        text: "MatchingInterface:web-other",
    },
];
