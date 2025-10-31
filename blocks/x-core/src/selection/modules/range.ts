import type { RangeEntry, TextEntry } from "../types";
import { BLOCK_TYPE } from "../utils/constant";

export class Range {
  /** 内建节点 */
  public readonly nodes: RangeEntry[];
  /** 选区方向反选 */
  public isBackward: boolean;
  /** 选区折叠状态 */
  public isCollapsed: boolean;

  /** 构造函数 */
  public constructor(nodes: RangeEntry[], isBackward?: boolean) {
    this.nodes = nodes;
    this.isBackward = !!isBackward;
    this.isCollapsed = !nodes.length;
    const { TEXT } = BLOCK_TYPE;
    if (nodes.length === 1 && nodes[0].type === TEXT && nodes[0].len === 0) {
      this.isCollapsed = true;
    }
  }

  /**
   * 克隆节点
   */
  public clone() {
    return new Range(this.nodes.slice());
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
