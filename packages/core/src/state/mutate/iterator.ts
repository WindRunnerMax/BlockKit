import type { Op } from "@block-kit/delta";
import { getOpLength, isDeleteOp, isInsertOp, isRetainOp, OP_TYPES } from "@block-kit/delta";

import { LeafState } from "../modules/leaf-state";
import type { LineState } from "../modules/line-state";

export class Iterator {
  /** 行索引 */
  protected row: number;
  /** 列索引 */
  protected col: number;
  /** Op 偏移 */
  protected offset: number;
  /** LineState 组 */
  protected lines: LineState[];

  /**
   * 构造函数
   * @param lines
   */
  constructor(lines: LineState[]) {
    this.lines = lines;
    this.row = 0;
    this.col = 0;
    this.offset = 0;
  }

  /**
   * 获取当前正在迭代的 Leaf
   */
  public peek(): LeafState | null {
    const line = this.lines[this.row];
    if (line) {
      return line.getLeaf(this.col);
    }
    return null;
  }

  /**
   * 获取当前迭代 Leaf 的剩余长度
   */
  public peekLength(): number {
    const leaf = this.peek();
    if (leaf) {
      return getOpLength(leaf.op) - this.offset;
    } else {
      return Infinity;
    }
  }

  /**
   * 获取当前迭代 Op 的类型
   */
  public peekType(): string {
    const leaf = this.peek();
    if (leaf) {
      const op = leaf.op;
      if (isDeleteOp(op)) {
        return OP_TYPES.DELETE;
      } else if (isRetainOp(op)) {
        return OP_TYPES.RETAIN;
      } else {
        return OP_TYPES.INSERT;
      }
    }
    return OP_TYPES.RETAIN;
  }

  /**
   * 移动指针 步入下一个 Leaf
   */
  public stepIntoNext(): void {
    const line = this.lines[this.row];
    if (!line) return void 0;
    const leaves = line.getLeaves();
    if (this.col < leaves.length - 1) {
      this.col++;
    } else {
      this.row++;
      this.col = 0;
    }
    this.offset = 0;
  }

  /**
   * 判断是否存在当前 Leaf
   */
  public hasNext(): boolean {
    // 即当前执行的 Leaf Op 存在未迭代的部分
    return this.peekLength() < Infinity;
  }

  /**
   * 初始 Retain 时获取 LineState[]
   * @param retain
   * @param newLines
   */
  public firstRetain(retain: number, newLines: LineState[]) {
    let firstRetain = retain;
    while (retain > 0) {
      const line = this.lines[this.row];
      if (!line || firstRetain < line.length) break;
      this.row++;
      newLines.push(line);
      firstRetain = firstRetain - line.length;
    }
    return firstRetain;
  }

  /**
   * 获取 Next Op 的部分/全部内容
   * @param length
   */
  public next(length?: number): LeafState | null {
    if (!length) {
      length = Infinity;
    }
    const nextLeaf = this.peek();
    if (nextLeaf) {
      const offset = this.offset;
      const opLength = getOpLength(nextLeaf.op);
      const restLength = opLength - offset;
      if (length >= restLength) {
        length = restLength;
        this.stepIntoNext();
      } else {
        this.offset = this.offset + length;
      }
      const op = nextLeaf.op;
      if (isInsertOp(op)) {
        // 起始与裁剪位置等同 NextOp => Immutable
        if (offset === 0 && op.insert.length <= length) {
          return nextLeaf;
        }
        const retOp: Op = {};
        if (nextLeaf.op.attributes) {
          retOp.attributes = nextLeaf.op.attributes;
        }
        retOp.insert = op.insert.substr(offset, length);
        const newLeaf = new LeafState(retOp, nextLeaf.parent);
        // 若 offset 是 0, 则直接复用原始的 key 值, 以及原始的 DOM Model
        !offset && newLeaf.updateKey(nextLeaf.key) && newLeaf.updateModel(nextLeaf);
        return newLeaf;
      }
      return nextLeaf;
    }
    return null;
  }

  /**
   * 获取剩余的所有 Leaf 以及 Line
   */
  public rest() {
    type Rest = { leaf: LeafState[]; line: LineState[] };
    const rest: Rest = { leaf: [], line: [] };
    if (!this.hasNext()) {
      // 不存在未迭代的部分
      return rest;
    } else if (this.offset === 0) {
      // 当前指针位置剩余完整的 Leaf
      if (this.col === 0) {
        // col === 0 && offset === 0 则直接返回剩余的 Line
        rest.line = this.lines.slice(this.row);
        return rest;
      }
      const line = this.lines[this.row];
      if (line) {
        rest.leaf = line.getLeaves().slice(this.col);
        rest.line = this.lines.slice(this.row + 1);
      }
      return rest;
    } else {
      // 当前指针位置非完整 Leaf
      const offset = this.offset;
      const row = this.row;
      const col = this.col;
      const next = this.next();
      const line = this.lines[row];
      if (line && next) {
        const leaves = line.getLeaves().slice(col + 1);
        rest.leaf = [next].concat(leaves);
        rest.line = this.lines.slice(row + 1);
      }
      this.offset = offset;
      this.row = row;
      this.col = col;
      return rest;
    }
  }
}
