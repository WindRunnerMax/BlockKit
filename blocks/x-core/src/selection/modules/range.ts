import type { RangeNode } from "../types";
import { POINT_TYPE } from "../utils/constant";

export class Range {
  /** 内建节点 */
  public readonly nodes: RangeNode[];
  /** 选区方向反选 */
  public isBackward: boolean;
  /** 选区折叠状态 */
  public isCollapsed: boolean;

  /** 构造函数 */
  public constructor(nodes: RangeNode[], isBackward?: boolean) {
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
}
