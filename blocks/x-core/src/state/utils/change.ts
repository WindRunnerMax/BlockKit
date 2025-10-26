import { getId } from "@block-kit/utils";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { ApplyChange } from "../types";

/**
 * 创建新 Block 的变更
 * @param editor
 * @param data
 */
export const createNewBlockChange = (editor: BlockEditor, data: BlockDataField): ApplyChange => {
  let id = getId(20);
  let max = 100;
  while (editor.state.blocks[id] && max-- > 0) {
    id = getId(10);
  }
  return { id: id, ops: [{ p: [], oi: data }] };
};

/**
 * 创建 Block 并将其插入到指定 Block 位置的变更
 * @param parentId
 * @param index
 * @param childId
 */
export const createInsertBlockChange = (
  parentId: string,
  index: number,
  childId: string
): ApplyChange => {
  return { id: parentId, ops: [{ p: ["children", index], li: childId }] };
};

/**
 * 将 children 从指定 Block 位置删除的变更
 * @param editor
 * @param parentId
 * @param index
 */
export const createDeleteBlockChange = (
  editor: BlockEditor,
  parentId: string,
  index: number
): ApplyChange => {
  const block = editor.state.getBlock(parentId);
  const child = block && block.data.children && block.data.children[index];
  return { id: parentId, ops: [{ p: ["children", index], ld: child }] };
};
