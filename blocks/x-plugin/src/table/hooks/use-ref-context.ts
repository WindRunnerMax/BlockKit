import type { BlockState } from "@block-kit/x-core";
import { createContext, useContext } from "react";

import type { TableStateContext } from "./use-state-context";

export type TableRefContext = {
  state: BlockState;
  setClientState: (state: Partial<TableStateContext>) => void;
  refreshTableState: () => void;
};

export const TableRefContext = createContext<TableRefContext>({
  state: null as unknown as BlockState,
  setClientState: () => void 0,
  refreshTableState: () => void 0,
});

export const useTableRefContext = () => {
  return useContext(TableRefContext);
};
