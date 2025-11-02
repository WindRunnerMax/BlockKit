import type { Op } from "@block-kit/delta";
import type { InsertOp } from "@block-kit/delta";
import { EOL } from "@block-kit/delta";

import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import { RawRange } from "../../selection/modules/raw-range";
import { Key } from "../utils/key";
import type { LineState } from "./line-state";

export class LeafState {
  /** Op 所属 Line 的索引 */
  public index: number;
  /** Op 行级起始偏移量 */
  public offset: number;
  /** 唯一 key 值 */
  public key: string;
  /** EOL 节点 */
  public readonly eol: boolean;
  /** Void 节点 */
  public readonly void: boolean;
  /** Embed 节点 */
  public readonly embed: boolean;
  /** Inline 节点 */
  public readonly inline: boolean;
  /** Op 长度 */
  public readonly length: number;

  constructor(
    /** Op 引用 */
    public op: Op,
    /** 父级 LineState */
    public parent: LineState
  ) {
    this.key = "";
    this.index = -1;
    this.offset = -1;
    this.eol = op.insert === EOL;
    const editor = parent.parent.editor;
    this.void = editor.schema.isVoid(op);
    this.embed = editor.schema.isEmbed(op);
    this.inline = editor.schema.isInline(op);
    this.length = op.insert ? op.insert.length : 0;
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      // 在开发模式和测试环境下冻结, 避免 immutable 的对象被修改
      Object.freeze(this.op);
      Object.freeze(this.op.attributes);
    }
  }

  /**
   * 获取文本内容
   */
  public getText() {
    return this.op.insert || "";
  }

  /**
   * 获取上一个 LeafState
   * @param span [?=false] 跨行查找
   */
  public prev(span = false) {
    const index = this.index;
    if (index < 0) return null;
    // 大于 0 则可以直接取前一个节点
    if (index > 0) {
      return this.parent.getLeaf(index - 1);
    }
    // index <=0 的情况下, 存在 span 跨行
    if (!span) return null;
    const prevLine = this.parent.prev();
    return prevLine ? prevLine.getLastLeaf() : null;
  }

  /**
   * 获取下一个 LeafState
   * @param span [?=false] 跨行查找
   */
  public next(span = false) {
    const index = this.index;
    if (index < 0) return null;
    // 小于 line.size-1 则可以直接取下一个节点
    if (index < this.parent.size - 1) {
      return this.parent.getLeaf(index + 1);
    }
    // index >= line.size - 1 的情况下, 存在 span 跨行
    if (!span) return null;
    const nextLine = this.parent.next();
    return nextLine ? nextLine.getFirstLeaf() : null;
  }

  /**
   * 裁剪当前 op
   * @param index
   * @param forward [?=false]
   */
  public sliceOp(index: number, forward = false): InsertOp {
    const text = this.getText();
    const op: InsertOp = {
      insert: forward ? text.slice(index, text.length) : text.slice(0, index),
    };
    if (this.op.attributes) {
      op.attributes = this.op.attributes;
    }
    return op;
  }

  /**
   * 强制刷新叶子 key
   * @param key
   */
  public updateKey(key: string) {
    if (!key) return key;
    this.key = key;
    return Key.update(this, key);
  }

  /**
   * 根据状态来尝试更新 DOM Model
   * @param leafState
   */
  public updateModel(leafState: LeafState | null) {
    const editor = this.parent.parent.editor;
    const dom = editor.model.getLeafNode(leafState);
    dom && editor.model.setLeafModel(dom, this);
  }

  /**
   * 获取 State 对应的 DOM 节点
   */
  public getDOMNode() {
    return this.parent.parent.editor.model.getLeafNode(this);
  }

  /**
   * 将 LeafState 转换为 Range
   */
  public toRange() {
    const start = new Point(this.parent.index, this.offset);
    const end = new Point(this.parent.index, this.offset + this.length);
    return new Range(start, end);
  }

  /**
   * 将 LeafState 转换为 RawRange
   */
  public toRawRange() {
    const range = this.toRange();
    const rawRange = RawRange.fromRange(this.parent.parent.editor, range);
    return rawRange;
  }
}
