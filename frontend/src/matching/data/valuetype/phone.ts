import SelectOption from "../../interfaces/select.option";

/**
 * Bitrix24 API phone types as select options
 * @see SelectOption
 * @see https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/multifield/multifield_fields.php
 */
export const valueTypePhone: SelectOption[] = [
    {
        value: "WORK",
        text: "MatchingInterface:phone-work",
    },
    {
        value: "MOBILE",
        text: "MatchingInterface:phone-mobile",
    },
    {
        value: "FAX",
        text: "MatchingInterface:phone-fax",
    },
    {
        value: "HOME",
        text: "MatchingInterface:phone-home",
    },
    {
        value: "PAGER",
        text: "MatchingInterface:phone-pager",
    },
    {
        value: "MAILING",
        text: "MatchingInterface:phone-mailing",
    },
    {
        value: "OTHER",
        text: "MatchingInterface:phone-other",
    },
];
