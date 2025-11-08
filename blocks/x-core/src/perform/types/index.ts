import type { ApplyOptions, BatchApplyChange } from "../../state/types";

/** 变更结果 */
export type PerformResult = {
  changes: BatchApplyChange;
  options?: ApplyOptions;
};
