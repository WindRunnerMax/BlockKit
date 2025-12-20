import type { BlocksChange } from "@block-kit/x-json";

import type { Range } from "../../selection/modules/range";

export type StackItem = {
  id: Set<string>;
  changes: BlocksChange;
  range: Range | null;
};

export type Stack = {
  undo: StackItem[];
  redo: StackItem[];
};
