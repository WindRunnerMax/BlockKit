import type { AttributeMap, Delta, Op } from "@block-kit/delta";
import type { InsertOp } from "@block-kit/delta";
import {
  cloneOp,
  composeAttributes,
  EOL_OP,
  isDeleteOp,
  isEOLOp,
  isEqualAttributes,
  isInsertOp,
  isRetainOp,
  normalizeEOL,
  OP_TYPES,
} from "@block-kit/delta";
import { OpIterator } from "@block-kit/delta";
import { isObject } from "@block-kit/utils";

import type { Editor } from "../../editor";
import type { BlockState } from "../modules/block-state";
import { LeafState } from "../modules/leaf-state";
import { LineState } from "../modules/line-state";
import { Iterator } from "./iterator";

export class Mutate {
  /** 插入的 ops */
  public inserts: InsertOp[];
  /** 修改的 ops */
  public revises: InsertOp[];
  /** 删除的 ops */
  public deletes: InsertOp[];
  /** 初始 Lines */
  public lines: LineState[];
  /** 新的 Lines */
  public newLines: LineState[];
  /** Editor 实例 */
  protected editor: Editor;

  /**
   * 构造函数
   * @param block
   */
  constructor(protected block: BlockState) {
    this.inserts = [];
    this.deletes = [];
    this.revises = [];
    this.newLines = [];
    this.editor = block.editor;
    this.lines = block.getLines();
  }

  /**
   * 在 LineState 插入 Leaf
   * @param lineState 当前正在处理的 LineState
   * @param newLeaf 即将准入的 LeafState
   */
  protected insert(lineState: LineState, newLeaf: LeafState): LineState {
    const leaves = lineState.getLeaves();
    const index = leaves.length;
    const lastLeaf = lineState.getLastLeaf();
    const lastOp = lastLeaf && lastLeaf.op;
    const newOp = newLeaf.op;
    // 如果 NewOp/LastOp 是 EOL 则会调度追加
    const isNewEOLOp = isEOLOp(newOp);
    const isLastEOLOp = isEOLOp(lastOp);
    if (isLastEOLOp) {
      lineState._appendLeaf(newLeaf);
      return lineState;
    }
    if (isNewEOLOp) {
      lineState._appendLeaf(newLeaf);
      // LineState 对象是新的, 可通过 Leaf 判断是否可复用 key
      // 1. Other Leaf 则为新 \n 2. This Leaf 则为原 \n
      const key = newLeaf.parent.key;
      this.newLines.push(lineState);
      // Other Leaf 是以新的 LineState 创建的, 因此 key 值相同
      // ref/key 值不相等, 那就说明是取得 This Leaf 的 key
      if (lineState !== newLeaf.parent) {
        // this.key => 复用 other.key => 更新
        lineState.updateKey(key);
        // 复用的 LineState 可以直接更新到 Model
        lineState.updateModel(newLeaf.parent);
      }
      lineState.updateLeaves();
      lineState._updateInternalOp(newOp);
      return LineState._create(this.block);
    }
    if (
      isObject<Op>(lastOp) &&
      isEqualAttributes(newOp.attributes, lastOp.attributes) &&
      isInsertOp(newOp) &&
      isInsertOp(lastOp) &&
      // Embed/Void 节点不可合并
      !this.editor.schema.hasVoidKey(lastOp)
    ) {
      // 合并相同属性的 insert
      const op: InsertOp = { insert: lastOp.insert + newOp.insert };
      if (isObject<AttributeMap>(lastOp.attributes)) {
        op.attributes = lastOp.attributes;
      }
      const newLastLeaf = new LeafState(op, lineState);
      newLastLeaf.updateKey(lastLeaf!.key);
      newLastLeaf.updateModel(lastLeaf!);
      lineState.setLeaf(index - 1, newLastLeaf);
      return lineState;
    }
    if (isInsertOp(newOp)) {
      lineState._appendLeaf(newLeaf);
    }
    return lineState;
  }

  /**
   * 组合 Ops
   * @param other 请注意, 该参数必须要先 normalize
   */
  public compose(other: Delta): LineState[] {
    this.inserts = [];
    this.deletes = [];
    this.revises = [];
    this.newLines = [];
    const otherOps = normalizeEOL(other.ops);
    const thisIter = new Iterator(this.lines);
    const otherIter = new OpIterator(otherOps);
    const firstOther = otherIter.peek();
    // 当前处理的 LineState, 初始化创建新的行节点
    let lineState = LineState._create(this.block);
    if (firstOther && isRetainOp(firstOther) && !firstOther.attributes) {
      // 初始的 retain 范围内的所有行数据, 直接追加到目标行组内, 返回剩余行级偏移量
      let firstLeft = thisIter.firstRetain(firstOther.retain, this.newLines);
      while (thisIter.peekType() === OP_TYPES.INSERT && thisIter.peekLength() <= firstLeft) {
        firstLeft = firstLeft - thisIter.peekLength();
        const leaf = thisIter.next();
        if (!leaf) continue;
        // 初始行数据在 thisIter.firstRetain 中处理完成
        // 其他 Op 则可直接追加到当前处理的 LineState
        lineState._appendLeaf(leaf);
      }
      // 若处理过的数据 > 0, 将 OtherIter 的指针前移
      if (firstOther.retain - firstLeft > 0) {
        otherIter.next(firstOther.retain - firstLeft);
      }
    }
    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (otherIter.peekType() === OP_TYPES.INSERT) {
        const leaf = new LeafState(otherIter.next(), lineState);
        lineState = this.insert(lineState, leaf);
        this.inserts.push(leaf.op as InsertOp);
        continue;
      }
      const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      const thisLeaf = thisIter.next(length);
      const otherOp = otherIter.next(length);
      // 1. 预设 retain 2. Infinity
      if (isRetainOp(otherOp)) {
        let newLeaf = thisLeaf;
        if (!thisLeaf || !newLeaf) {
          continue;
        }
        if (otherOp.attributes) {
          const attrs = composeAttributes(thisLeaf.op.attributes, otherOp.attributes);
          const newOp = cloneOp(thisLeaf.op);
          newOp.attributes = attrs;
          newLeaf = new LeafState(newOp, thisLeaf.parent);
          newLeaf.updateKey(thisLeaf.key) && newLeaf.updateModel(thisLeaf);
          this.revises.push({ insert: newOp.insert!, attributes: otherOp.attributes });
        }
        lineState = this.insert(lineState, newLeaf);
        // 如果 Other 已经到达末尾, 且不对数据造成影响, 处理剩余数据
        if (!otherIter.hasNext() && newLeaf === thisLeaf) {
          // 处理剩余的 Leaves 和 Lines, 直接追加到目标行组内
          const rest = thisIter.rest();
          for (const leaf of rest.leaf) {
            lineState = this.insert(lineState, leaf);
          }
          this.newLines.push(...rest.line);
          return this.newLines;
        }
        continue;
      }
      if (isDeleteOp(otherOp)) {
        thisLeaf && this.deletes.push(thisLeaf.op as InsertOp);
        continue;
      }
    }
    // 当行状态存在值或者当前没有行时, 补齐行数据内容
    // WARN: 这里需要注意会影响协同, 理论上需要避免操作末尾的 \n 符号
    if (lineState.getLeaves().length || !this.newLines.length) {
      this.insert(lineState, new LeafState(cloneOp(EOL_OP), lineState));
    }
    return this.newLines;
  }
}
