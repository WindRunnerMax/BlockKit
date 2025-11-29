import type { Op } from "@block-kit/delta";
import type { ROOT_BLOCK } from "@block-kit/utils";

/** Block 类型基础属性 */
export interface BasicBlock {
  /** Block 类型  */
  type: string;
  /**
   * Block 文本类型
   * - 重点关注, 该类型的存在意味着该 Block 是文本类型节点
   */
  delta?: Op[];
  /** Block 父节点 */
  parent: string;
  /** Block 子节点 */
  children: string[];
}

/** Block 类型属性扩展 */
export interface BlockModule {
  root: {
    type: typeof ROOT_BLOCK;
  };
  text: {
    type: "text";
    delta: Op[];
  };
}
