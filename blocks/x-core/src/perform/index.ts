import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import { getOpMetaMarks } from "../lookup/utils/marks";
import { Entry } from "../selection/modules/entry";
import type { Range } from "../selection/modules/range";
import type { ApplyChange, ApplyOptions } from "../state/types";
import type { PerformResult } from "./types";
import {
  createDeleteBlockChange,
  createInsertBlockChange,
  createNewBlockChange,
  createTextChange,
} from "./utils/change";

export class Perform {
  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: BlockEditor) {}

  /**
   * 插入文本
   * @param sel
   * @param text
   */
  public insertText(sel: Range, text: string): PerformResult | null {
    if (!sel.length) return null;
    const changes: ApplyChange[] = [];
    const options: ApplyOptions = {};
    const result = { changes, options };
    if (!sel.isCollapsed) {
      const res = this.deleteFragment(sel);
      res && result.changes.push(...res.changes);
      res && Object.assign(result.options, res.options);
    }
    const firstBlock = this.editor.state.getBlock(sel.at(0)!.id);
    if (!firstBlock) return result;
    const prevBlock = firstBlock.prev();
    let prevBlockId = prevBlock ? prevBlock.id : "";
    // 没有前节点的情况下需要创建空白的文本节点
    if (!prevBlock) {
      const data: BlockDataField = { type: "text", children: [], delta: [], parent: "" };
      const newBlockChange = createNewBlockChange(this.editor, data);
      prevBlockId = newBlockChange.id;
      const insertBlockChange = createInsertBlockChange(firstBlock.data.parent, 0, newBlockChange);
      changes.push(newBlockChange, insertBlockChange);
    }
    if (!prevBlockId) return result;
    let attributes: AttributeMap | undefined = this.editor.lookup.marks;
    if (!sel.isCollapsed && prevBlock) {
      // 非折叠选区时, 需要以 start 起始判断该节点的尾部 marks
      const meta = this.editor.lookup.getLeafAtPoint(prevBlock.id, prevBlock.length);
      attributes = getOpMetaMarks(this.editor, meta!);
    }
    const len = prevBlock ? prevBlock.length : 0;
    const delta = new Delta().retain(len).insert(text, attributes);
    const textChange = createTextChange(prevBlockId, delta);
    changes.push(textChange);
    return result;
  }

  /**
   * 删除选区片段
   * @param sel
   */
  public deleteFragment(sel: Range): PerformResult | null {
    if (sel.isCollapsed || !sel.length) return null;
    const options: ApplyOptions = {};
    const changes: ApplyChange[] = [];
    for (let i = 0, n = sel.nodes.length; i < n; ++i) {
      const entry = sel.nodes[i];
      const state = entry && this.editor.state.getBlock(entry.id);
      if (!entry || !state) {
        continue;
      }
      if ((i === 0 || i === n - 1) && Entry.isTextEntry(entry)) {
        const delta = new Delta().retain(entry.start).delete(entry.len);
        changes.push(createTextChange(entry.id, delta));
        continue;
      }
      const parentId = state.data.parent;
      const change = createDeleteBlockChange(this.editor, parentId, state.index);
      parentId && changes.push(change);
    }
    return { changes, options };
  }
}
