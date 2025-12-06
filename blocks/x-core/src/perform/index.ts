import { getFirstUnicodeLen, getLastUnicodeLen } from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import { ROOT_BLOCK } from "@block-kit/utils";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import type { ContentChangeEvent } from "../event/bus";
import { getOpMetaMarks } from "../lookup/utils/marks";
import { Entry } from "../selection/modules/entry";
import { Point } from "../selection/modules/point";
import { Range } from "../selection/modules/range";
import type { RangeEntry, TextPoint } from "../selection/types";
import { POINT_TYPE } from "../selection/utils/constant";
import type { ApplyOptions, BatchApplyChange } from "../state/types";
import { Atom } from "./modules/atom";

export class Perform {
  /** BlockMap 原子化变更 */
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
  public insertText(sel: Range, text: string): ContentChangeEvent | null {
    if (!sel.length) return null;
    const changes: BatchApplyChange = [];
    const options: ApplyOptions = {};
    let entry: RangeEntry | null = sel.at(0)!;
    if (!sel.isCollapsed) {
      const delRes = this.deleteFragment(sel);
      if (delRes && delRes.options.selection) {
        entry = delRes.options.selection.at(0)!;
      }
    }
    // 理论上来说, 此时的 Entry 类型只应该是 TextEntry
    if (!entry || !Entry.isText(entry)) {
      return this.editor.state.apply(changes, options);
    }
    const start = Point.create(entry.id, POINT_TYPE.TEXT, entry.start);
    let attributes: AttributeMap | undefined = this.editor.lookup.marks;
    // 非折叠选区时, 需要以 start 起始判断该节点的尾部 marks
    if (!sel.isCollapsed) {
      const meta = this.editor.lookup.getLeafAtOffset(start.id, start.offset);
      attributes = getOpMetaMarks(this.editor, meta!);
    }
    const delta = new Delta().retain(start.offset).insert(text, attributes);
    const textChange = this.atom.updateText(start.id, delta);
    changes.push(textChange);
    return this.editor.state.apply(changes, options);
  }

  /**
   * 删除选区片段
   * @param sel
   */
  public deleteFragment(sel: Range): ContentChangeEvent | null {
    if (sel.isCollapsed || !sel.length) return null;
    const options: ApplyOptions = {};
    const changes: BatchApplyChange = [];
    const firstEntry = sel.at(0)!;
    const lastEntry = sel.at(-1)!;
    const firstBlock = this.editor.state.getBlock(firstEntry.id);
    const lastBlock = this.editor.state.getBlock(lastEntry.id);
    if (!firstBlock || !lastBlock) return null;
    // 记录已经删除的父节点, 此时子节点就不必删除
    const deleted = new Set<string>();
    // 记录父节点删除单子节点应该保留的情况
    const remain: string[] = [];
    // ========== 遍历选区节点, 逐一执行删除 ==========
    for (let i = 0, n = sel.length; i < n; ++i) {
      const entry = sel.at(i);
      const state = entry && this.editor.state.getBlock(entry.id);
      if (!entry || !state) continue;
      // 处理首个文本节点类型
      if (i === 0 && Entry.isText(entry)) {
        const delDelta = new Delta().retain(entry.start).delete(entry.len);
        changes.push(this.atom.updateText(entry.id, delDelta));
        // 如果首尾节点不在同一块内, 需要将尾节点的内容合并到首节点中
        if (Entry.isText(lastEntry) && firstBlock.id !== lastBlock.id) {
          const start = lastEntry.len;
          const end = lastBlock.length;
          const sliceDelta = new Delta(lastBlock.data.delta!).slice(start, end);
          const mergeDelta = new Delta().retain(entry.start).merge(sliceDelta);
          changes.push(this.atom.updateText(firstBlock.id, mergeDelta));
        }
        continue;
      }
      // 处理末尾文本节点类型
      LAST_ENTRY: if (i === n - 1 && Entry.isText(entry)) {
        // 如果首尾节点不在同一个块, 且首节点为文本节点, 则将其作为块节点删除
        if (firstBlock.id !== lastBlock.id && Entry.isText(firstEntry)) {
          break LAST_ENTRY;
        }
        // 如果首尾节点不在同一个块, 且首节点为块级节点, 则保留该块内容
        if (firstBlock.id !== lastBlock.id && Entry.isBlock(firstEntry)) {
          const delDelta = new Delta().delete(entry.len);
          changes.push(this.atom.updateText(entry.id, delDelta));
        }
        continue;
      }
      const parentId = state.data.parent;
      // 块级节点需要删除整个节点, 父节点已经删除的不再处理
      const isParentDeleted = parentId && deleted.has(parentId);
      // 如果父节点是文本节点, 则不会删除所有子节点, 在此处需要继续处理
      const isTextParentBlock = state.parent && !state.parent.isBlockType();
      if (!isParentDeleted || isTextParentBlock) {
        const change = this.atom.remove(parentId, state.index);
        changes.push(change);
        deleted.add(state.id);
      }
      // 删除的块节点需要将子节点收集, 未删除的需要重新插入到父节点中
      // 由于块节点仅存在直属类型的子节点, 会被直接删除, 因此这里仅文本块需要处理
      const children = state.data.children;
      !state.isBlockType() && remain.push(...children);
    }
    // ========== 预设删除后的选区, 需要根据不同的情况处理 ==========
    // 首个节点为文本节点, 直接设置选区到该位置
    if (Entry.isText(firstEntry)) {
      const offset = firstEntry.start;
      const entry = Entry.create(firstBlock.id, POINT_TYPE.TEXT, offset, 0);
      options.selection = new Range([entry], false);
      // 首个节点非文本节点且尾节点为文本节点的情况下, 设置到尾节点的文本位置
    } else if (Entry.isText(lastEntry)) {
      const entry = Entry.create(lastBlock.id, POINT_TYPE.TEXT, 0, 0);
      options.selection = new Range([entry], false);
      // 此时首尾节点都是块类型, 需要根据情况判断是否需要创建新的块
    } else {
      const prevBlock = firstBlock.prev();
      // 存在前节点且前节点是文本块的情况下, 选区设置到前节点的末尾
      if (prevBlock && !prevBlock.isBlockType()) {
        const offset = prevBlock.length;
        const entry = Entry.create(lastBlock.id, POINT_TYPE.TEXT, offset, 0);
        options.selection = new Range([entry], false);
        // 同级无前节点的情况下需要创建空白的文本节点
      } else {
        const data: BlockDataField = { type: "text", children: [], delta: [], parent: "" };
        const parentId = firstBlock.data.parent;
        const newBlockChange = this.atom.create(data);
        const insertBlockChange = this.atom.insert(parentId, 0, newBlockChange);
        changes.push(newBlockChange, insertBlockChange);
        const entry = Entry.create(newBlockChange.id, POINT_TYPE.TEXT, 0, 0);
        options.selection = new Range([entry], false);
      }
    }
    // ========== 处理保留的子节点插入 ==========
    const firstPoint = options.selection && options.selection.getFirstPoint();
    if (firstPoint && remain.length) {
      const block = this.editor.state.getBlock(firstPoint.id);
      const subNodes = new Set<string>(block ? block.data.children : []);
      let index = 0;
      for (const childId of remain) {
        if (subNodes.has(childId) || deleted.has(childId)) continue;
        const moveChanges = this.atom.move(childId, firstPoint.id, index++);
        changes.push(moveChanges);
      }
    }
    return this.editor.state.apply(changes, options);
  }

  /**
   * 向后删除字符
   * - 这里的后指的是 CARET 位置左侧的内容
   * @param sel
   */
  public deleteBackward(sel: Range): ContentChangeEvent | null {
    if (!sel || sel.isEmpty()) return null;
    if (!sel.isCollapsed || Entry.isBlock(sel.at(0)!)) {
      return this.deleteFragment(sel);
    }
    const options: ApplyOptions = {};
    const changes: BatchApplyChange = [];
    const start = sel.getFirstPoint() as TextPoint;
    const block = this.editor.state.getBlock(start.id);
    if (!block) return null;
    // 如果处于当前行的行首, 需要根据状态处理情况
    if (start.offset === 0) {
      const prevBlock = block.prevSiblingNode();
      // 如果没有前节点, 或者前节点是 root, 则不能执行删除操作
      if (!prevBlock || prevBlock.data.type === ROOT_BLOCK) return null;
      // 如果前节点是块节点, 则移动选区到前节点上
      if (prevBlock.isBlockType()) {
        const entry = Entry.create(prevBlock.id, POINT_TYPE.BLOCK);
        options.selection = new Range([entry], false);
        return this.editor.state.apply(changes, options);
      }
      // 将当前节点的内容合并到前节点中, 并且删除当前节点
      const entry1 = Entry.create(prevBlock.id, POINT_TYPE.TEXT, prevBlock.length, 0);
      const entry2 = Entry.create(block.id, POINT_TYPE.TEXT, 0, 0);
      return this.deleteFragment(new Range([entry1, entry2], false));
    }
    const op = this.editor.lookup.getBackwardOpAtOffset(block.id, start.offset);
    let len = 1;
    if (op && op.insert) {
      len = getLastUnicodeLen(op.insert);
    }
    const startOffset = start.offset - len;
    const delta = new Delta().retain(startOffset).delete(len);
    changes.push(this.atom.updateText(block.id, delta));
    return this.editor.state.apply(changes, options);
  }

  /**
   * 向前删除字符
   * - 这里的前指的是 CARET 位置右侧的内容
   * @param sel
   */
  public deleteForward(sel: Range): ContentChangeEvent | null {
    if (!sel || sel.isEmpty()) return null;
    if (!sel.isCollapsed || Entry.isBlock(sel.at(0)!)) {
      return this.deleteFragment(sel);
    }
    const options: ApplyOptions = {};
    const changes: BatchApplyChange = [];
    const start = sel.getFirstPoint() as TextPoint;
    const block = this.editor.state.getBlock(start.id);
    if (!block) return null;
    // 如果处于当前行的行尾, 需要根据状态处理情况
    if (start.offset === block.length) {
      const nextBlock = block.nextSiblingNode();
      // 如果没有后节点, 则不能执行删除操作
      if (!nextBlock) return null;
      // 如果后节点是块节点, 则移动选区到后节点上
      if (nextBlock.isBlockType()) {
        const entry = Entry.create(nextBlock.id, POINT_TYPE.BLOCK);
        options.selection = new Range([entry], false);
        return this.editor.state.apply(changes, options);
      }
      // 将当前节点的内容合并到前节点中, 并且删除当前节点
      const entry1 = Entry.create(block.id, POINT_TYPE.TEXT, block.length, 0);
      const entry2 = Entry.create(nextBlock.id, POINT_TYPE.TEXT, 0, 0);
      return this.deleteFragment(new Range([entry1, entry2], false));
    }
    const op = this.editor.lookup.getForwardOpAtOffset(block.id, start.offset);
    let len = 1;
    if (op && op.insert) {
      len = getFirstUnicodeLen(op.insert);
    }
    const delta = new Delta().retain(start.offset).delete(len);
    changes.push(this.atom.updateText(block.id, delta));
    return this.editor.state.apply(changes, options);
  }

  /**
   * 插入换行符
   * @param sel
   * @param attributes
   */
  public insertBreak(sel: Range, data?: BlockDataField): ContentChangeEvent | null {
    if (!sel || sel.isEmpty()) return null;
    const changes: BatchApplyChange = [];
    const options: ApplyOptions = {};
    if (!sel.isCollapsed) {
      const res = this.deleteFragment(sel);
      const first = sel.at(0)!;
      const last = sel.at(-1)!;
      if (Entry.isBlock(first) || Entry.isBlock(last)) {
        return res;
      }
      res && (options.selection = res.options.selection);
    }
    // 执行到这里一定是折叠的选区
    const entry = options.selection ? options.selection.at(0)! : sel.at(0)!;
    const block = this.editor.state.getBlock(entry.id);
    if (!block || !block.data.parent || Entry.isBlock(entry)) {
      return this.editor.state.apply(changes, options);
    }

    // 文本节点需要拆分当前节点
    const start = entry.start;
    const del = new Delta().retain(start).delete(block.length - start);
    const content = new Delta(block.data.delta).slice(start, block.length);
    const newData = data || { type: "text", children: [], delta: [], parent: "" };
    newData.delta = content.ops;
    const delChange = this.atom.updateText(block.id, del);
    const newBlockChange = this.atom.create(newData);
    const parentId = block.children.length ? block.id : block.data.parent;
    const index = block.children.length ? 0 : block.index + 1;
    const insertBlockChange = this.atom.insert(parentId, index, newBlockChange);
    changes.push(delChange, newBlockChange, insertBlockChange);
    const newEntry = Entry.create(newBlockChange.id, POINT_TYPE.TEXT, 0, 0);
    options.selection = new Range([newEntry], false);
    return this.editor.state.apply(changes, options);
  }
}
