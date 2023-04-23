import { useTranslation } from "react-i18next";
import { useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import FieldItem from "../FieldItem";
import { MatchingContext } from "../../context/matching.context";
import { useMutation, useQueryClient } from "react-query";

interface IProps {
    entity: string;
    buttonTitle?: string;
}

/**
 * List of configurable field component.
 * @param entity - matching entity
 * @param buttonTitle - save button localized text
 * @param contractItem - base mathing entity field with match
 * @see FieldItem
 * @constructor
 */
export default function FieldList({ entity, buttonTitle }: IProps) {
    const { t } = useTranslation();
    const { items, setContractItem, saveHandler } = useContext(MatchingContext);

    const queryClient = useQueryClient();
    const mutation = useMutation(() => saveHandler(entity, items), {
        onSuccess: () => {
            queryClient.setQueryData(["column", entity], items);
        },
    });

    useEffect(() => {
        const key = Object.keys(items).find(key => items[key].isContract) ?? "";
        setContractItem(items[key] ?? null);
    }, [items]);

    return (
        <>
            <div>
                {Object.entries(items).map(([key, item]) => (
                    <FieldItem key={key} field={key} item={item} />
                ))}
            </div>
            <Button variant="outlined" onClick={async () => await mutation.mutateAsync()}>
                {buttonTitle || t("main:btn-save")}
            </Button>
        </>
    );
}
