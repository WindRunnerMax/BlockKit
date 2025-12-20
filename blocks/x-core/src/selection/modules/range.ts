import type { BlockEditor } from "../../editor";
import type { RangeEntry, RangePoint, TextEntry } from "../types";
import { normalizeModelRange } from "../utils/normalize";
import { Entry } from "./entry";
import { Point } from "./point";

export class Range {
  /** 内建节点 */
  public readonly nodes: RangeEntry[];
  /** 选区方向反选 */
  public readonly isBackward: boolean;
  /**
   * 选区折叠状态
   * - 没有 Entry 时为折叠
   * - 只有单个 Block Entry 时为折叠
   * - 只有单个 Text Entry 且选区长度为 0 时为折叠
   */
  public readonly isCollapsed: boolean;
  /** 选区 Entries 长度 */
  public readonly length: number;

  /** 构造函数 */
  public constructor(nodes: RangeEntry | RangeEntry[], isBackward?: boolean) {
    const entries = Array.isArray(nodes) ? nodes : [nodes];
    this.nodes = entries;
    this.length = entries.length;
    this.isBackward = !!isBackward;
    this.isCollapsed = !entries.length;
    const firstEntry = entries.length === 1 && entries[0];
    if (firstEntry && Entry.isBlock(firstEntry)) {
      this.isCollapsed = true;
    }
    if (firstEntry && Entry.isText(firstEntry) && firstEntry.len === 0) {
      this.isCollapsed = true;
    }
  }

  /**
   * 获取 Entry
   */
  public at(index: number): RangeEntry | null {
    if (index < 0) {
      return this.nodes[this.nodes.length + index] || null;
    }
    return this.nodes[index] || null;
  }

  /**
   * 切片 RangeEntry[]
   * @param start
   * @param end
   */
  public slice(start?: number, end?: number): RangeEntry[] {
    return this.nodes.slice(start, end);
  }

  /**
   * 获取选区首个节点
   */
  public getFirstPoint(): RangePoint | null {
    const first = this.nodes.length && this.at(0);
    if (!first) return null;
    return Entry.isText(first)
      ? Point.create(first.id, first.type, first.start)
      : Point.create(first.id, first.type);
  }

  /**
   * 获取选区末尾节点
   */
  public getLastPoint(): RangePoint | null {
    const last = this.nodes.length && this.at(-1);
    if (!last) return null;
    return Entry.isText(last)
      ? Point.create(last.id, last.type, last.start + last.len)
      : Point.create(last.id, last.type);
  }

  /**
   * 判断 Range 是否为空
   */
  public isEmpty(): boolean {
    return this.nodes.length === 0;
  }

  /**
   * 克隆节点
   */
  public clone() {
    return new Range(this.nodes.slice());
  }

  /**
   * 合并 Range 取最大范围
   * @param range1
   * @param range2
   * @returns
   */
  public static aggregate(
    editor: BlockEditor,
    range1: Range | null,
    range2: Range | null
  ): Range | null {
    if (!range1 || !range2) return null;
    const start1 = range1.getFirstPoint();
    const start2 = range2.getFirstPoint();
    const end1 = range1.getLastPoint();
    const end2 = range2.getLastPoint();
    if (!start1 || !start2 || !end1 || !end2) return null;
    const start = Point.isBefore(editor, start1, start2) ? start1 : start2;
    const end = Point.isAfter(editor, end1, end2) ? end1 : end2;
    const entries = normalizeModelRange(editor, start, end);
    return new Range(entries);
  }

  /**
   * 判断 Range 是否相等
   * @param range1
   * @param range2
   */
  public static equals(range1: Range | null, range2: Range | null): boolean {
    if (range1 === range2) return true;
    if (!range1 || !range2 || range1.nodes.length !== range2.nodes.length) return false;
    for (let i = 0; i < range1.nodes.length; i++) {
      const n1 = range1.nodes[i] as TextEntry;
      const n2 = range2.nodes[i] as TextEntry;
      if (n1.id !== n2.id || n1.type !== n2.type || n1.start !== n2.start || n1.len !== n2.len) {
        return false;
      }
    }
    return true;
  }
}
