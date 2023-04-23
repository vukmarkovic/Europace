import Column from "../types/column";
import { createContext, Dispatch, SetStateAction } from "react";
import CallMethodHandler from "../interfaces/call.method.handler";
import EntityType from "../enum/entity.type";
import ColumnConfig from "../types/column.config";

/**
 * Matching interface manager context.
 * Used to avoid lots of props passing down.
 */
interface IMatchingContext {
    configs: Record<string, EntityType[]>;
    config: EntityType[];
    setConfig: Dispatch<SetStateAction<EntityType[]>>;
    items: Column;
    setItems: Dispatch<SetStateAction<Column>>;
    contractItem: ColumnConfig | null;
    setContractItem: Dispatch<SetStateAction<ColumnConfig | null>>;
    loadHandler: (entityType: string) => Promise<Column>;
    saveHandler: (entity: string, items: Column) => Promise<any>;
    bxMethodHandler: CallMethodHandler;
}

export const MatchingContext = createContext({} as IMatchingContext);
