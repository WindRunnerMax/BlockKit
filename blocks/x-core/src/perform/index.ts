import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { BlockDataField } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import { getOpMetaMarks } from "../lookup/utils/marks";
import { Entry } from "../selection/modules/entry";
import { Point } from "../selection/modules/point";
import { Range } from "../selection/modules/range";
import type { RangeEntry } from "../selection/types";
import { POINT_TYPE } from "../selection/utils/constant";
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
    const result: PerformResult = { changes, options };
    let delRes: PerformResult | null = null;
    let entry: RangeEntry | null = sel.at(0)!;
    if (!sel.isCollapsed && (delRes = this.deleteFragment(sel))) {
      result.changes.push(...delRes.changes);
      Object.assign(result.options!, delRes.options);
      if (delRes.options && delRes.options.selection) {
        entry = delRes.options.selection.at(0)!;
      }
    }
    // 理论上来说, 此时的 Entry 类型只应该是 TextEntry
    if (!entry || !Entry.isText(entry)) return result;
    const start = Point.create(entry.id, POINT_TYPE.TEXT, entry.start);
    let attributes: AttributeMap | undefined = this.editor.lookup.marks;
    // 非折叠选区时, 需要以 start 起始判断该节点的尾部 marks
    if (!sel.isCollapsed) {
      const meta = this.editor.lookup.getLeafAtPoint(start.id, start.offset);
      attributes = getOpMetaMarks(this.editor, meta!);
    }
    const delta = new Delta().retain(start.offset).insert(text, attributes);
    const textChange = this.atom.updateText(start.id, delta);
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
      // 块级节点需要删除整个节点
      const parentId = state.data.parent;
      if (parentId && !deleted.has(parentId)) {
        const change = this.atom.remove(parentId, state.index);
        deleted.add(state.id);
        changes.push(change);
      }
      // 删除的块节点需要将子节点收集, 未删除的需要重新插入到父节点中
      const children = state.data.children;
      for (const child of children) {
        remain.push(child);
      }
    }
    // ========== 预设删除后的选区, 需要根据不同的情况处理 ==========
    if (Entry.isText(firstEntry)) {
      // 首个节点为文本节点, 直接设置选区到该位置
      const offset = firstEntry.start;
      const entry = Entry.create(firstBlock.id, POINT_TYPE.TEXT, offset, 0);
      options.selection = new Range([entry], false);
    } else if (Entry.isText(lastEntry)) {
      // 首个节点非文本节点且尾节点为文本节点的情况下, 设置到尾节点的文本位置
      const entry = Entry.create(lastBlock.id, POINT_TYPE.TEXT, 0, 0);
      options.selection = new Range([entry], false);
    } else {
      // 此时首尾节点都是块类型, 需要根据情况判断是否需要创建新的块
      const prevBlock = firstBlock.prev();
      if (prevBlock && !prevBlock.isBlockNode()) {
        // 存在前节点且前节点是文本块的情况下, 选区设置到前节点的末尾
        const offset = prevBlock.length;
        const entry = Entry.create(lastBlock.id, POINT_TYPE.TEXT, offset, 0);
        options.selection = new Range([entry], false);
      } else {
        // 同级无前节点的情况下需要创建空白的文本节点
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
      const exists = new Set<string>(block ? block.data.children : []);
      let index = 0;
      for (const childId of remain) {
        if (exists.has(childId) || deleted.has(childId)) continue;
        const moveChanges = this.atom.move(childId, firstPoint.id, index++);
        changes.push(moveChanges);
      }
    }
    return { changes, options };
  }

  /**
   * 执行变更结果
   * @param result
   */
  public applyChanges(result: PerformResult | null) {
    const changes = result ? result.changes : [];
    const options = result ? result.options : {};
    return this.editor.state.apply(changes, options);
  }
}
