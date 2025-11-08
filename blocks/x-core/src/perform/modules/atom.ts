import type { Delta } from "@block-kit/delta";
import { getId } from "@block-kit/utils";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { ApplyChange } from "../../state/types";

export class Atom {
  public constructor(protected editor: BlockEditor) {}

  /**
   * 创建新 Block 的变更
   * - 通常需要配合 insertBlock 调用
   * @param data 初始化数据
   */
  public createBlock = (parentId: string, data: Omit<BlockDataField, "parent">): ApplyChange => {
    const blocks = this.editor.state.blocks;
    let id = getId(20);
    let max = 100;
    while (blocks[id] && max-- > 0) {
      id = getId(20);
    }
    const newBlock = Object.assign({ parent: parentId }, data);
    return { id: id, ops: [{ p: [], oi: newBlock }] };
  };

  /**
   * 将 Block 插入到指定 Block 子节点位置的变更
   * - 并行创建节点时, 需要保证新创建的节点 parentId 一致性
   * @param parentId 父节点 id
   * @param index 位置索引
   * @param childId 子节点 id
   */
  public insertBlock = (parentId: string, index: number, childId: string): ApplyChange[] => {
    const changes: ApplyChange[] = [];
    const child = this.editor.state.getBlock(childId);
    if (child && child.data.parent !== parentId) {
      const updateParentChange: ApplyChange = {
        id: childId,
        ops: [{ p: ["parent"], od: child.data.parent, oi: parentId }],
      };
      changes.push(updateParentChange);
    }
    const updateChildrenChange: ApplyChange = {
      id: parentId,
      ops: [{ p: ["children", index], li: childId }],
    };
    changes.push(updateChildrenChange);
    return changes;
  };

  /**
   * 将 children 从指定 Block 位置删除的变更
   * @param parentId  父节点 id
   * @param index 位置索引
   */
  public deleteBlock = (parentId: string, index: number): ApplyChange => {
    const block = this.editor.state.getBlock(parentId);
    const childId = block && block.data.children && block.data.children[index];
    return { id: parentId, ops: [{ p: ["children", index], ld: childId }] };
  };

  /**
   * 生成文本变更
   * @param id 变更块 id
   * @param delta Delta 变更内容
   */
  public updateText = (id: string, delta: Delta): ApplyChange => {
    return { id, ops: [{ p: ["delta"], t: "delta", o: delta }] };
  };
}
