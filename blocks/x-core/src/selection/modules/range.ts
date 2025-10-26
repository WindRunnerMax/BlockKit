import type { RangeNode } from "../types";

export class Range {
  /** 内建节点 */
  public readonly nodes: RangeNode[];

  /** 构造函数 */
  public constructor(nodes: RangeNode[]) {
    this.nodes = nodes;
  }

  /**
   * 克隆节点
   */
  public clone() {
    return new Range(this.nodes.slice());
  }
}
