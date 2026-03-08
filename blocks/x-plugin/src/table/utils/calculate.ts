import type { BlockState } from "@block-kit/x-core";

import type { TableStateContext } from "../hooks/use-state-context";
import type { TableBlockDataType } from "../types";

export const resetTableState = (state: BlockState): TableStateContext => {
  const data = state.data as TableBlockDataType;
  return {
    state,
    config: data.config,
    trs: [],
    size: data.size,
  };
};
