import type { P } from "@block-kit/utils/dist/es/types";

import type { BlockEditor } from "../../editor";
import type { PerformResult } from "../types";

/**
 * 处理删除时的预留节点
 * @param editor 编辑器实例
 * @param remain 预留节点 ID 列表
 * @param deleted 已删除节点 ID 集合
 * @param changes 变更列表
 * @param options 变更选项
 */
export const reserveDeletedNodes = (
  editor: BlockEditor,
  remain: string[],
  deleted: Set<string>,
  options: P.NonNullable<PerformResult["options"]>
) => {
  const changes: PerformResult["changes"] = [];
  const firstPoint = options.selection && options.selection.getFirstPoint();
  if (firstPoint && remain.length) {
    const block = editor.state.getBlock(firstPoint.id);
    const exists = new Set<string>(block ? block.data.children : []);
    let index = 0;
    for (const childId of remain) {
      if (exists.has(childId) || deleted.has(childId)) continue;
      const moveChanges = editor.perform.atom.move(childId, firstPoint.id, index++);
      changes.push(moveChanges);
    }
  }
  return changes;
};
