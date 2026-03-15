import type { BlockState } from "@block-kit/x-core";
import { createContext, useContext } from "react";

import type { TableStateContext } from "./use-state-context";

export type TableRefContext = {
  state: BlockState;
  setClientState: (state: Partial<TableStateContext>) => void;
  refreshTableState: () => void;
  anchorCell: [number, number, number, number] | null;
};

export const TableRefContext = createContext<TableRefContext>({
  state: null as unknown as BlockState,
  setClientState: () => void 0,
  refreshTableState: () => void 0,
  anchorCell: null,
});

export const useTableRefContext = () => {
  return useContext(TableRefContext);
};
