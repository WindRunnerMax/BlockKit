import type { ApplyChange, ApplyOptions } from "../../state/types";

/** 变更结果 */
export type PerformResult = {
  changes: ApplyChange[];
  options?: ApplyOptions;
};
