import { isString, List } from "@block-kit/utils";
import type { Block, BlocksChange, JSONOp } from "@block-kit/x-json";
import { json } from "@block-kit/x-json";

import type { BlockEditor } from "../../editor";
import type { EditorState } from "../index";
import { clearTreeCache } from "../utils/tree";
import { BlockState } from "./state";

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
   * 应用数据变更到指定 Block
   * @param block 目标 Block 状态
   * @param ops 变更操作
   */
  protected applyToBlock(block: BlockState, ops: JSONOp[]) {
    block.isDirty = true;
    block.version++;
    // 空路径情况应该由父级状态管理调度 Insert 处理
    const changes = ops.filter(op => op && op.p.length);
    json.apply(block.data, changes);
    const inserts: Set<string> = new Set();
    const deletes: Set<string> = new Set();
    for (const op of changes) {
      // 若是 children 的新增变更, 则需要同步相关的 Block 状态
      if (op.p[0] === "children" && isString(op.li)) {
        inserts.add(op.li);
      }
      // 若是 children 的删除变更, 则需要同步相关的 Block 状态
      if (op.p[0] === "children" && isString(op.ld)) {
        deletes.add(op.ld);
      }
    }
    if (inserts.size || deletes.size) {
      clearTreeCache(block);
    }
    return { inserts, deletes };
  }

  /**
   * 应用编辑器更新
   * @param changes
   */
  public apply(changes: BlocksChange) {
    // 优先处理新建的 Block 节点操作变更
    for (const [blockId, ops] of Object.entries(changes)) {
      const block = this.state.getBlock(blockId);
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
        newBlockState.restore();
        this.state.blocks[blockId] = newBlockState;
      }
    }
    // 新建的节点处理后才可以应用变更
    for (const [blockId, ops] of Object.entries(changes)) {
      const block = this.state.getBlock(blockId);
      if (!block) continue;
      this.updates.add(blockId);
      const result = this.applyToBlock(block, ops);
      this.inserts = List.union(this.inserts, result.inserts);
      this.deletes = List.union(this.deletes, result.deletes);
    }
    // 变更的状态更新需要统一处理, 否则会因为树形副作用导致计算差异
    /** 已经更新过 Meta 的节点 */
    const updatedMeta = new Set<string>();
    // 处理更新节点的情况
    for (const id of this.updates) {
      const block = this.state.getBlock(id);
      block && !updatedMeta.has(id) && block._updateMeta();
      updatedMeta.add(id);
    }
    // 处理删除节点的情况
    for (const id of this.deletes) {
      const ldBlock = this.state.getOrCreateBlock(id);
      const isBlockType = ldBlock.isBlockType();
      const nodes = ldBlock.getTreeNodes();
      // 文本类型的节点仅需要处理本身
      ldBlock.remove();
      for (let i = 1; i < nodes.length; i++) {
        const child = nodes[i];
        // 块级节点需要处理本身及其子树节点
        isBlockType && child.remove();
      }
    }
    // 处理新增节点的情况
    for (const id of this.inserts) {
      const liBlock = this.state.getOrCreateBlock(id);
      const nodes = liBlock.getTreeNodes();
      const isBlockType = liBlock.isBlockType();
      // 文本类型的节点仅需要处理本身
      liBlock.restore();
      updatedMeta.add(id);
      for (let i = 1; i < nodes.length; i++) {
        const child = nodes[i];
        // 文本类子节点不标记状态, 仅更新元信息
        IF_L1: if (!isBlockType) {
          if (updatedMeta.has(child.id)) break IF_L1;
          child._updateMeta(true);
          // 块级节点需要处理本身及其子树节点
        } else {
          child.restore();
        }
        updatedMeta.add(child.id);
      }
    }
    // 如果节点同时被删除和插入, 则认为是更新操作, 需要恢复节点挂载状态
    // 否则可能会造成移动的情况下, 节点被认为是删除的情况(顺序问题)
    // 虽然存在误判的可能, 但通常应该不会出现刚创建就删除的批量执行场景
    for (const id of this.inserts) {
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
