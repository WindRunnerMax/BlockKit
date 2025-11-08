import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import { getOpMetaMarks } from "../lookup/utils/marks";
import { Entry } from "../selection/modules/entry";
import type { Range } from "../selection/modules/range";
import type { ApplyOptions, BatchApplyChange } from "../state/types";
import { Atom } from "./modules/atom";
import type { PerformResult } from "./types";

export class Perform {
  /** 原子化变更 BlockMap */
  public atom: Atom;

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: BlockEditor) {
    this.atom = new Atom(editor);
  }

  /**
   * 插入文本
   * @param sel
   * @param text
   */
  public insertText(sel: Range, text: string): PerformResult | null {
    if (!sel.length) return null;
    const changes: BatchApplyChange = [];
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
      const parentId = firstBlock.data.parent;
      const newBlockChange = this.atom.create(data);
      prevBlockId = newBlockChange.id;
      const insertBlockChange = this.atom.insert(parentId, 0, newBlockChange);
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
    const textChange = this.atom.updateText(prevBlockId, delta);
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
    const changes: BatchApplyChange = [];
    // 记录已经删除的父节点，子节点就不必删除
    const deleted = new Set<string>();
    for (let i = 0, n = sel.length; i < n; ++i) {
      const entry = sel.at(i);
      const state = entry && this.editor.state.getBlock(entry.id);
      if (!entry || !state) {
        continue;
      }
      if ((i === 0 || i === n - 1) && Entry.isTextEntry(entry)) {
        const delta = new Delta().retain(entry.start).delete(entry.len);
        changes.push(this.atom.updateText(entry.id, delta));
        continue;
      }
      const parentId = state.data.parent;
      if (parentId && !deleted.has(parentId)) {
        const change = this.atom.remove(parentId, state.index);
        deleted.add(state.id);
        changes.push(change);
      }
    }
    return { changes, options };
  }
}
