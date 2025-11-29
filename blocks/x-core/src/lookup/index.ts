import type { AttributeMap } from "@block-kit/delta";
import type { Op } from "@block-kit/delta";
import { getOpLength } from "@block-kit/delta";
import { Bind } from "@block-kit/utils";

import type { BlockEditor } from "../editor";
import type { SelectionChangeEvent } from "../event/bus/";
import { EDITOR_EVENT } from "../event/bus/";
import { Entry } from "../selection/modules/entry";
import type { OpMeta } from "./types";
import { getOpMetaMarks } from "./utils/marks";

export class Lookup {
  /** 选区折叠时的 marks */
  public marks: AttributeMap = {};

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: BlockEditor) {
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  /**
   * 基于 Offset 获取索引位置的 Leaf Meta
   * @param blockId
   * @param offset
   */
  public getLeafAtOffset(blockId: string, offset: number): OpMeta | null {
    const block = this.editor.state.getBlock(blockId);
    if (!block || !block.data.delta) return null;
    let index = offset;
    const ops = block.data.delta;
    for (let i = 0, n = ops.length; i < n; ++i) {
      const op = ops[i];
      const opLength = getOpLength(op);
      if (index > opLength) {
        index = index - opLength;
        continue;
      }
      const tail = index - opLength >= 0;
      return { op, ops, index: i, length: opLength, offset: index, tail };
    }
    return null;
  }

  /**
   * 基于 Offset 获取索引位置的 Op 内容
   * @param point
   */
  public getBackwardOpAtOffset(blockId: string, offset: number): Op | null {
    const meta = this.getLeafAtOffset(blockId, offset);
    const newOp = meta && meta.op;
    if (!newOp || !newOp.insert) return null;
    newOp.insert = newOp.insert!.slice(0, meta.offset);
    return newOp;
  }

  /**
   * 选区变化事件
   * @param event
   */
  @Bind
  protected onSelectionChange(event: SelectionChangeEvent) {
    const current = event.current;
    if (!current || !current.isCollapsed || !current.length) {
      this.marks = {};
      return void 0;
    }
    const entry = current.at(0)!;
    if (!Entry.isText(entry)) {
      return void 0;
    }
    const meta = this.getLeafAtOffset(entry.id, entry.start);
    if (!meta) return void 0;
    const attributes = getOpMetaMarks(this.editor, meta);
    this.marks = attributes || {};
    return void 0;
  }
}
