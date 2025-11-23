import type { BlockEditor } from "../../editor";
import type { Range } from "../../selection/modules/range";
import type { RangeEntry } from "../../selection/types";
import type { BlockState } from "../../state/modules/block-state";

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
    if (state.isBlockNode()) {
      const treeNodes = state.getTreeNodes();
      for (const node of treeNodes) cb(entry, node);
    } else {
      cb(entry, state);
    }
  }
};
