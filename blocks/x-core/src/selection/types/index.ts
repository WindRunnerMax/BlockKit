import type { O } from "@block-kit/utils/dist/es/types";

import type { BLOCK_TYPE } from "../utils/constant";

/** 选区点类型 */
export type BlockType = O.Values<typeof BLOCK_TYPE>;

/** 块级选区点 */
export type BlockPoint = {
  id: string;
  type: typeof BLOCK_TYPE.BLOCK;
};

/** 文本选区点 */
export type TextPoint = {
  id: string;
  type: typeof BLOCK_TYPE.TEXT;
  offset: number;
};

/** 选区节点类型 */
export type RangePoint = BlockPoint | TextPoint;

/** 块级元素类型 */
export type BlockEntry = BlockPoint;

/** 文本元素类型 */
export type TextEntry = {
  id: string;
  type: typeof BLOCK_TYPE.TEXT;
  start: number;
  len: number;
};

/** 选区元素类型 */
export type RangeEntry = BlockEntry | TextEntry;
