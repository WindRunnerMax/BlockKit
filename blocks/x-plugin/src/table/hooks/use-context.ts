import type { BlockState } from "@block-kit/x-core";
import { createContext, useContext } from "react";

export type TableStateContext = {
  state: BlockState;
  widths: number[];
  trs: HTMLTableRowElement[];
  size: [row: number, col: number];
};

export const TableContext = createContext<TableStateContext>({
  state: null as unknown as BlockState,
  widths: [],
  trs: [],
  size: [0, 0],
});

export const useTableContext = () => {
  return useContext(TableContext);
};
