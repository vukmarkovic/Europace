import SelectOption from "../../interfaces/select.option";

/**
 * Bitrix24 API email types as select options
 * @see SelectOption
 * @see https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/multifield/multifield_fields.php
 */
export const valueTypeEmail: SelectOption[] = [
    {
        value: "WORK",
        text: "MatchingInterface:email-work",
    },
    {
        value: "HOME",
        text: "MatchingInterface:email-home",
    },
    {
        value: "MAILING",
        text: "MatchingInterface:email-mailing",
    },
    {
        value: "OTHER",
        text: "MatchingInterface:email-other",
    },
];
