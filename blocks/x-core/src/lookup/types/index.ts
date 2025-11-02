import type { Op } from "@block-kit/delta";

export type OpMeta = {
  /** Op */
  op: Op;
  /** Ops */
  ops: Op[];
  /** Op 索引 */
  index: number;
  /** Op 长度 */
  length: number;
  /** 节点的文本偏移 */
  offset: number;
  /** 判断是否是 Leaf 的尾部 */
  tail: boolean;
};
