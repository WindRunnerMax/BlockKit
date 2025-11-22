import { List } from "@block-kit/utils";
import type { Block, BlocksChange } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { EditorState } from "../index";
import { BlockState } from "../modules/block-state";

export class Mutate {
  /** 插入的 Block */
  public inserts: Set<string>;
  /** 更新的 Block */
  public updates: Set<string>;
  /** 删除的 Block */
  public deletes: Set<string>;
  /** 编辑器实例 */
  protected editor: BlockEditor;

  /**
   * 构造函数
   * @param state
   */
  public constructor(protected state: EditorState) {
    this.inserts = new Set();
    this.updates = new Set();
    this.deletes = new Set();
    this.editor = state.editor;
  }

  /**
   * 应用编辑器更新
   * @param changes
   */
  public apply(changes: BlocksChange) {
    for (const [blockId, ops] of Object.entries(changes)) {
      let block = this.state.getBlock(blockId);
      // 如果不存在节点, 则需要检查是否需要新增 Block [Insert]
      const insert = !block && ops.find(it => !it.p.length && it.oi);
      if (!block && insert) {
        this.inserts.add(blockId);
        const data: Block = {
          id: blockId,
          version: 0,
          data: insert.oi as unknown as Block["data"],
        };
        const newBlockState = new BlockState(data, this.state);
        this.state.blocks[blockId] = newBlockState;
        newBlockState._updateMeta();
        block = newBlockState;
      }
      if (!block) continue;
      this.updates.add(blockId);
      const result = block._apply(ops);
      this.inserts = List.union(this.inserts, result.inserts);
      this.deletes = List.union(this.deletes, result.deletes);
    }
    // 如果节点同时被删除和插入, 则认为是更新操作, 需要恢复节点挂载状态
    // 否则可能会造成移动的情况下, 节点被认为是删除的情况(顺序问题)
    // 虽然存在误判的可能, 但通常不会出现刚创建就删除的批量执行场景
    for (const id of Array.from(this.inserts)) {
      if (!this.deletes.has(id)) continue;
      this.inserts.delete(id);
      this.deletes.delete(id);
      this.updates.add(id);
      const state = this.state.getBlock(id);
      state && state.restore();
    }
    return {
      inserts: this.inserts,
      updates: this.updates,
      deletes: this.deletes,
    };
  }
}
