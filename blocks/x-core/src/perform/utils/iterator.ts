import { Delta } from "@block-kit/delta";
import { isTextDeltaOp } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import { isBoxBlockType } from "../../schema/utils/is";
import type { Range } from "../../selection/modules/range";
import type { RangeEntry } from "../../selection/types";
import type { BlockState } from "../../state/modules/state";
import type { BatchApplyChange } from "../../state/types";

/**
 * 获取选区内的所有节点的迭代器
 * - 如果 entry 与 state 的 id 不一致, 则说明是块节点的子节点
 * @param editor
 * @param range
 */
export const iterator = (
  editor: BlockEditor,
  range: Range,
  cb: (entry: RangeEntry, state: BlockState) => void
) => {
  for (const entry of range.nodes) {
    const state = editor.state.getBlock(entry.id);
    if (!state) continue;
    // 仅容器节点需要遍历其子节点
    if (isBoxBlockType(state)) {
      const treeNodes = state.getTreeNodes();
      for (const node of treeNodes) {
        cb(entry, node);
      }
    } else {
      cb(entry, state);
    }
  }
};

/**
 * 应用 Delta 变更到指定 Block 的 Delta 上
 * @param block
 * @param changes
 */
export const batchApplyDelta = (block: BlockState, changes: BatchApplyChange) => {
  const id = block.id;
  const ops = block.data.delta;
  if (!ops) return new Delta();
  let transformedDelta = new Delta(ops);
  for (const changeGroup of changes) {
    const changeArray = Array.isArray(changeGroup) ? changeGroup : [changeGroup];
    for (const change of changeArray) {
      if (change.id !== id) continue;
      for (const op of change.ops) {
        if (!isTextDeltaOp(op)) continue;
        transformedDelta = transformedDelta.compose(new Delta(op.o));
      }
    }
  }
  return transformedDelta;
};
