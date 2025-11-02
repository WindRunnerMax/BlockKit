import type { Delta } from "@block-kit/delta";
import { getId } from "@block-kit/utils";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { ApplyChange } from "../../state/types";

/**
 * 创建新 Block 的变更
 * @param editor 编辑器实例
 * @param data 初始化数据
 */
export const createNewBlockChange = (
  editor: BlockEditor,
  data: Omit<BlockDataField, "parent">
): ApplyChange => {
  let id = getId(20);
  let max = 100;
  while (editor.state.blocks[id] && max-- > 0) {
    id = getId(20);
  }
  return { id: id, ops: [{ p: [], oi: data }] };
};

/**
 * 创建 Block 并将其插入到指定 Block 位置的变更
 * @param parentId 父节点 id
 * @param index 位置索引
 * @param child createNewBlockChange 新增子节点变更
 */
export const createInsertBlockChange = (
  parentId: string,
  index: number,
  child: ApplyChange
): ApplyChange => {
  for (const op of child.ops) {
    !op.p.length && op.oi && (op.oi.parent = parentId);
  }
  return { id: parentId, ops: [{ p: ["children", index], li: child.id }] };
};

/**
 * 将 children 从指定 Block 位置删除的变更
 * @param editor 编辑器实例
 * @param parentId  父节点 id
 * @param index 位置索引
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

/**
 * 生成文本变更
 * @param id Block id
 * @param delta Delta 变更内容
 */
export const createTextChange = (id: string, delta: Delta): ApplyChange => {
  return { id, ops: [{ p: ["delta"], t: "delta", o: delta }] };
};
