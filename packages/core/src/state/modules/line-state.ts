import type { AttributeMap } from "@block-kit/delta";
import type { Op } from "@block-kit/delta";
import { cloneOp, Delta, EOL, getOpLength } from "@block-kit/delta";
import { isInsertOp } from "@block-kit/delta";
import { OpIterator } from "@block-kit/delta";

import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import { Key } from "../utils/key";
import type { BlockState } from "./block-state";
import { LeafState } from "./leaf-state";

export class LineState {
  /** 唯一 key */
  public key: string;
  /** 行节点 op */
  public op: Op;
  /** 行 Leaf 数量 */
  public size: number;
  /** 行起始偏移 */
  public start: number;
  /** 行号索引 */
  public index: number;
  /** 行文本总宽度 */
  public length: number;
  /** 标记更新子节点 */
  public isDirty = false;
  /** Leaf 节点 */
  protected leaves: LeafState[] = [];
  /** Ops 缓存 */
  protected _ops: Op[] | null = null;

  constructor(
    /** Delta 数据 */
    delta: Delta,
    /** 行属性 */
    public attributes: AttributeMap,
    /** 父级 BlockState */
    public readonly parent: BlockState
  ) {
    this.key = "";
    this.size = -1;
    this.start = -1;
    this.index = -1;
    this.length = -1;
    this._initFromDelta(delta);
    this.op = { insert: EOL, attributes };
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      // 在开发模式和测试环境下冻结, 避免 immutable 的对象被修改
      Object.freeze(this.op);
      Object.freeze(this.attributes);
    }
  }

  /**
   * 获取 Leaf 节点
   * @param index
   */
  public getLeaf(index: number): LeafState | null {
    return this.leaves[index] || null;
  }

  /**
   * 设置 Leaf 节点
   * @param leaf
   * @param index
   */
  public setLeaf(index: number, leaf: LeafState) {
    if (this.leaves[index] === leaf) {
      return this;
    }
    this.isDirty = true;
    this.leaves[index] = leaf;
    if (this._ops) {
      this._ops[index] = leaf.op;
    }
    leaf.index = index;
    leaf.key = leaf.key || Key.getId(leaf);
    return this;
  }

  /**
   * 获取行内所有 Leaf 节点
   */
  public getLeaves() {
    return this.leaves;
  }

  /**
   * 获取行内第一个节点
   */
  public getFirstLeaf(): LeafState | null {
    const leaves = this.getLeaves();
    return leaves[0] || null;
  }

  /**
   * 获取行内最后一个节点
   */
  public getLastLeaf(): LeafState | null {
    const leaves = this.getLeaves();
    return leaves[leaves.length - 1] || null;
  }

  /**
   * 更新所有 Leaf 节点
   * @param leaves 叶子节点
   * @returns 行宽度
   */
  public updateLeaves(leaves?: LeafState[]) {
    if (leaves) {
      this.leaves = leaves;
    }
    let offset = 0;
    const ops: Op[] = [];
    this.leaves.forEach((leaf, index) => {
      ops.push(leaf.op);
      leaf.offset = offset;
      leaf.parent = this;
      leaf.index = index;
      offset = offset + leaf.length;
      leaf.key = leaf.key || Key.getId(leaf);
    });
    this._ops = ops;
    this.length = offset;
    this.isDirty = false;
    this.size = this.leaves.length;
    return offset;
  }

  /**
   * 通过 Leaves 获取行 Ops
   */
  public getOps() {
    if (this._ops) {
      return this._ops;
    }
    this._ops = this.leaves.map(leaf => leaf.op);
    return this._ops;
  }

  /**
   * 获取行文本
   */
  public getText() {
    return this.getOps()
      .map(op => op.insert)
      .join("");
  }

  /**
   * 获取行属性
   */
  public getLineAttrs() {
    return this.attributes;
  }

  /**
   * 向前查找行状态
   * @param len [?=1] 索引跨越长度
   */
  public prev(len = 1) {
    return this.parent.getLine(this.index - len);
  }

  /**
   * 向后查找行状态
   * @param len [?=1] 索引跨越长度
   */
  public next(len = 1) {
    return this.parent.getLine(this.index + len);
  }

  /**
   * 获取行片段
   * @param start
   * @param end
   */
  public slice(start: number, end: number) {
    const ops = this.getOps();
    if (!start && end >= this.length) {
      return ops;
    }
    const nextOps: Op[] = [];
    const iter = new OpIterator(ops);
    let index = 0;
    while (index < end && iter.hasNext()) {
      let nextOp: Op | null = null;
      if (index < start) {
        nextOp = iter.next(start - index);
      } else {
        nextOp = iter.next(end - index);
        nextOps.push(nextOp);
      }
      index = index + getOpLength(nextOp);
    }
    return nextOps;
  }

  /**
   * 强制刷新行 key
   */
  public forceRefresh() {
    this.key = Key.refresh(this);
  }

  /**
   * 强制刷新行 key
   * @param key
   */
  public updateKey(key: string) {
    if (!key) return key;
    this.key = key;
    return Key.update(this, key);
  }

  /**
   * 根据状态来尝试更新 DOM Model
   * @param lineState
   */
  public updateModel(lineState: LineState | null) {
    const editor = this.parent.editor;
    const dom = editor.model.getLineNode(lineState);
    dom && editor.model.setLineModel(dom, this);
  }

  /**
   * 转换 Range 对象
   * @param start
   * @param end
   */
  public toRange() {
    const start = new Point(this.index, 0);
    const end = new Point(this.index, this.length);
    return new Range(start, end);
  }

  /**
   * 获取 State 对应的 DOM 节点
   */
  public getNode() {
    return this.parent.editor.model.getLineNode(this);
  }

  /**
   * 追加 LeafState
   * @param delta
   * @internal 仅编辑器内部使用
   */
  public _appendLeaf(leaf: LeafState) {
    leaf.offset = this.length;
    this.leaves.push(leaf);
    leaf.index = this.size;
    this.size++;
    leaf.key = leaf.key || Key.getId(leaf);
    this.length = this.length + leaf.length;
  }

  /**
   * 通过 delta 创建 Leaves
   * @internal 仅编辑器内部使用
   */
  public _initFromDelta(delta: Delta) {
    this._ops = [];
    this.leaves = [];
    this.isDirty = false;
    let offset = 0;
    for (const op of delta.ops) {
      if (!isInsertOp(op) || !op.insert.length) {
        this.parent.editor.logger.warning("Invalid op in LineState", op);
        continue;
      }
      const leaf = new LeafState(op, this);
      leaf.offset = offset;
      leaf.key = Key.getId(leaf);
      leaf.index = this._ops.length;
      this.leaves.push(leaf);
      this._ops.push(op);
      offset = offset + op.insert.length;
    }
    this.length = offset;
    this.size = this.leaves.length;
  }

  /**
   * 更新内建 Op 值, 认为即将并入 BlockState
   * - 仅应在 Mutate 中使用, 其余场景应保持 immutable
   * @internal 仅编辑器内部使用
   */
  public _updateInternalOp(op: Op) {
    const newOp = cloneOp(op);
    this.op = newOp;
    this.attributes = newOp.attributes || {};
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      // 在开发模式和测试环境下冻结, 避免 immutable 的对象被修改
      Object.freeze(this.op);
      Object.freeze(this.attributes);
    }
  }

  /**
   * 创建空的 LineState
   * @param block
   * @internal 仅编辑器内部使用
   */
  public static _create(block: BlockState) {
    return new LineState(new Delta([]), {}, block);
  }
}
