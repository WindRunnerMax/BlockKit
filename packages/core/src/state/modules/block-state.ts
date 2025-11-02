import type { Op } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import { cloneOps } from "@block-kit/delta";
import { ROOT_BLOCK } from "@block-kit/utils";

import type { Editor } from "../../editor";
import { Key } from "../utils/key";
import { LineState } from "./line-state";

export class BlockState {
  /** Block 行数量 */
  public size;
  /** Block 内容长度 */
  public length;
  /** Block Key */
  public readonly key: string;
  /** LineState 集合 */
  protected lines: LineState[] = [];

  constructor(public editor: Editor, base: Delta) {
    this.key = ROOT_BLOCK;
    let offset = 0;
    this.lines = [];
    // 初始化创建 LineState
    base.eachLine((delta, attributes, index) => {
      const lineState = new LineState(delta, attributes, this);
      lineState.index = index;
      lineState.start = offset;
      lineState.key = Key.getId(lineState);
      offset = offset + lineState.length;
      this.lines[index] = lineState;
    });
    this.length = offset;
    this.size = this.lines.length;
  }

  /**
   * 按照索引获取 LineState
   */
  public getLine(index: number): LineState | null {
    return this.lines[index] || null;
  }

  /**
   * 获取所有 LineState
   */
  public getLines() {
    return this.lines;
  }

  /**
   * 更新所有 LineState
   * @param lines
   * @returns 块宽度
   */
  public updateLines(lines?: LineState[]) {
    if (lines) {
      this.lines = lines;
    }
    let offset = 0;
    this.lines.forEach((line, index) => {
      line.index = index;
      line.start = offset;
      line.key = line.key || Key.getId(line);
      const size = line.isDirty ? line.updateLeaves() : line.length;
      offset = offset + size;
    });
    this.length = offset;
    this.size = this.lines.length;
    return offset;
  }

  /**
   * 获取 State 对应的 DOM 节点
   */
  public getDOMNode() {
    return this.editor.model.getBlockNode(this);
  }

  /**
   * 转换为 Delta
   * @param deep [?=undef] 深拷贝
   */
  public toDelta(deep?: boolean) {
    const ops: Op[] = [];
    for (const line of this.lines) {
      ops.push(...line.getOps());
    }
    return new Delta({
      ops: deep ? cloneOps(ops) : ops,
    });
  }
}
