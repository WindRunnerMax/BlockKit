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
    for (const [changeId, ops] of Object.entries(changes)) {
      let block = this.state.getBlock(changeId);
      // 如果不存在节点, 则需要检查是否需要新增 Block [Insert]
      const insert = !block && ops.find(it => !it.p.length && it.oi);
      if (!block && insert) {
        this.inserts.add(changeId);
        const data: Block = {
          id: changeId,
          version: 0,
          data: insert.oi as unknown as Block["data"],
        };
        const newBlockState = new BlockState(data, this.state);
        this.state.blocks[changeId] = newBlockState;
        newBlockState._updateMeta();
        block = newBlockState;
      }
      if (!block) continue;
      const result = block._apply(ops);
      this.inserts = List.union(this.inserts, result.inserts);
      this.deletes = List.union(this.deletes, result.deletes);
    }
    return {
      inserts: this.inserts,
      updates: this.updates,
      deletes: this.deletes,
    };
  }
}
