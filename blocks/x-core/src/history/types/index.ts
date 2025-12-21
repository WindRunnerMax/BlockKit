import type { BlocksChange } from "@block-kit/x-json";

import type { Range } from "../../selection/modules/range";

export type StackItem = {
  /** id 集合 */
  id: Set<string>;
  /** 组合变更 */
  changes: BlocksChange;
  /** 变更前选区 */
  range: Range | null;
  /** 变更后选区 */
  latestRange: Range | null;
};

export type Stack = {
  undo: StackItem[];
  redo: StackItem[];
};
