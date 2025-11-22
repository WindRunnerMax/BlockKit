import type { RangeEntry, TextEntry } from "../types";
import { POINT_TYPE } from "../utils/constant";
import { Entry } from "./entry";
import { Point } from "./point";

export class Range {
  /** 内建节点 */
  public readonly nodes: RangeEntry[];
  /** 选区方向反选 */
  public readonly isBackward: boolean;
  /** 选区折叠状态 */
  public readonly isCollapsed: boolean;
  /** 选区 Entries 长度 */
  public readonly length: number;

  /** 构造函数 */
  public constructor(nodes: RangeEntry[], isBackward?: boolean) {
    this.nodes = nodes;
    this.length = nodes.length;
    this.isBackward = !!isBackward;
    this.isCollapsed = !nodes.length;
    if (nodes.length === 1 && nodes[0].type === POINT_TYPE.TEXT && nodes[0].len === 0) {
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
   * 克隆节点
   */
  public clone() {
    return new Range(this.nodes.slice());
  }

  /**
   * 获取选区首个节点
   */
  public getFirstPoint() {
    if (!this.nodes.length) return null;
    const first = this.nodes[0];
    return Entry.isText(first)
      ? Point.create(first.id, first.type, first.start)
      : Point.create(first.id, first.type);
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
