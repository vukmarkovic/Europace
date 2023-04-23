import SelectOption from "../../interfaces/select.option";

/**
 * Bitrix24 API address types as select options
 * @see SelectOption
 * @see https://dev.1c-bitrix.ru/rest_help/crm/auxiliary/enum/crm_enum_addresstype.php
 */
export const valueTypeAddress: SelectOption[] = [
    {
        value: "1",
        text: "MatchingInterface:address-1",
    },
    {
        value: "4",
        text: "MatchingInterface:address-4",
    },
    {
        value: "6",
        text: "MatchingInterface:address-6",
    },
    {
        value: "9",
        text: "MatchingInterface:address-9",
    },
];
