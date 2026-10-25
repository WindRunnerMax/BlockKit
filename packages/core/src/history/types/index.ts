import type { Delta } from "@block-kit/delta";
import type { O } from "@block-kit/utils/dist/es/types";

import type { RawRange } from "../../selection/modules/raw-range";

export type StackItem = {
  delta: Delta;
  id: Set<string>;
  range: RawRange | null;
};

export type Stack = {
  undo: StackItem[];
  redo: StackItem[];
};

/** 内容变更对撤销栈造成的效果 */
export const HISTORY_EFFECT = {
  /** 未记录: 空变更 / REMOTE / undoable:false / 空 delta */
  NONE: 0,
  /** 并入上一格栈 */
  MERGE: 1,
  /** 新开一格栈 */
  APPEND: 2,
  /** 新开一格并丢掉最旧一格, 栈满触发 */
  APPEND_DROP: 3,
  /** 合并后完全抵消, 撤销栈少一格 */
  MERGE_DROP: 4,
} as const;

/** 内容变更对撤销栈造成的效果 */
export type HistoryEffect = O.Values<typeof HISTORY_EFFECT>;
