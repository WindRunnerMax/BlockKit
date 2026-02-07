import type { Delta } from "@block-kit/delta";
import { getId, isString } from "@block-kit/utils";
import type { Path } from "@block-kit/x-json";
import type { BlockDataField, JSONOp } from "@block-kit/x-json";
import { json } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { ApplyChange } from "../../state/types";

export class Atom {
  public constructor(protected editor: BlockEditor) {}

  /**
   * 获取 Block 节点指定 path 数据
   * @param blockId 块节点 id
   * @param path 数据路径
   */
  public get(blockId: string, path: Path): unknown | null {
    const block = this.editor.state.getBlock(blockId);
    if (!block) return null;
    const data = block.data;
    return json.get(data, path);
  }

  /**
   * 创建新 Block 的变更
   * - 通常需要配合 insert 调用
   * @param data 初始化数据
   */
  public create(data: Omit<BlockDataField, "parent">): ApplyChange {
    const blocks = this.editor.state.blocks;
    let id = getId(20);
    let max = 100;
    while (blocks[id] && max-- > 0) {
      id = getId(20);
    }
    (<BlockDataField>data).parent = "";
    return { id: id, ops: [{ p: [], oi: data }] };
  }

  /**
   * 将 Block 插入到指定 Block 子节点位置的变更
   * - 并行创建节点时, 需要保证新创建的节点 parentId 一致性
   * @param parentId 父节点 id
   * @param index 位置索引
   * @param childIdOrNewBlock 子节点 id / create 的 ApplyChange
   */
  public insert(
    parentId: string,
    index: number,
    childIdOrNewBlock: string | ApplyChange
  ): ApplyChange[] {
    const changes: ApplyChange[] = [];
    let childId: string;
    if (isString(childIdOrNewBlock)) {
      childId = childIdOrNewBlock;
      const child = this.editor.state.getBlock(childId);
      if (child && child.data.parent !== parentId) {
        const updateChildParentChange: ApplyChange = {
          id: childId,
          ops: [{ p: ["parent"], od: child.data.parent, oi: parentId }],
        };
        changes.push(updateChildParentChange);
      }
    } else {
      childId = childIdOrNewBlock.id;
      let op: JSONOp | null = null;
      if ((op = childIdOrNewBlock.ops[0]) && !op.p.length && op.oi) {
        // 这里会原地修改 newBlockChange 的内容, 注意副作用
        op.oi = { ...op.oi, parent: parentId };
      }
    }
    const insertChildChange: ApplyChange = {
      id: parentId,
      ops: [{ p: ["children", index], li: childId }],
    };
    changes.push(insertChildChange);
    return changes;
  }

  /**
   * 将子节点从指定 Block 位置删除的变更
   * @param parentId  父节点 id
   * @param index 位置索引
   */
  public remove(parentId: string, index: number): ApplyChange {
    const block = this.editor.state.getBlock(parentId);
    const childId = block && block.data.children && block.data.children[index];
    return { id: parentId, ops: [{ p: ["children", index], ld: childId }] };
  }

  /**
   * 某节点子节点位置移动的变更
   * @param nodeId 将要移动节点 id
   * @param toParentId  新的父节点 id
   * @param index 新的位置索引
   */
  public move(nodeId: string, toParentId: string, index: number): ApplyChange[] {
    const block = this.editor.state.getBlock(nodeId);
    if (!block) return [];
    const changes: ApplyChange[] = [
      { id: block.data.parent, ops: [{ p: ["children", block.index], ld: nodeId }] },
      { id: toParentId, ops: [{ p: ["children", index], li: nodeId }] },
      { id: nodeId, ops: [{ p: ["parent"], od: block.data.parent, oi: toParentId }] },
    ];
    return changes;
  }

  /**
   * 生成文本变更
   * @param id 变更块 id
   * @param delta Delta 变更内容
   */
  public updateText(id: string, delta: Delta): ApplyChange {
    return { id, ops: [{ p: ["delta"], t: "delta", o: delta.ops }] };
  }

  /**
   * 更新 Block 节点指定 path 数据的变更
   * @param blockId 块节点 id
   * @param path 数据路径
   * @param value 新值
   */
  public updateAttr(blockId: string, path: Path, value: unknown): ApplyChange {
    const initial = this.get(blockId, path);
    return {
      id: blockId,
      ops: [{ p: path, od: initial, oi: value }],
    };
  }
}
