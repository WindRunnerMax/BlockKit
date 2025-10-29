import type { RangePoint } from "../types";
import { POINT_TYPE } from "../utils/constant";
import { Point } from "./point";

export class Range {
  /** 内建节点 */
  public readonly nodes: RangePoint[];
  /** 选区方向反选 */
  public isBackward: boolean;
  /** 选区折叠状态 */
  public isCollapsed: boolean;

  /** 构造函数 */
  public constructor(nodes: RangePoint[], isBackward?: boolean) {
    this.nodes = nodes;
    this.isBackward = !!isBackward;
    this.isCollapsed = !nodes.length;
    const { TEXT } = POINT_TYPE;
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
      if (!Point.isEqual(range1.nodes[i], range2.nodes[i])) {
        return false;
      }
    }
    return true;
  }
}
