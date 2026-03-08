import type { BlockState } from "@block-kit/x-core";
import { createContext, useContext } from "react";

import type { CellConfig } from "../types";

export type TableStateContext = {
  state: BlockState;
  config: CellConfig[];
  trs: HTMLTableRowElement[];
  size: [row: number, col: number];
};

export const TableStateContext = createContext<TableStateContext>({
  state: null as unknown as BlockState,
  config: [],
  trs: [],
  size: [0, 0],
});

export const useTableStateContext = () => {
  return useContext(TableStateContext);
};
