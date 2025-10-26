import type { O } from "@block-kit/utils/dist/es/types";

import type { POINT_TYPE } from "../utils/constant";

/** 选区点类型 */
export type PointType = O.Values<typeof POINT_TYPE>;

/** 块级选区点 */
export type BlockPoint = {
  id: string;
  type: typeof POINT_TYPE.BLOCK;
};

/** 文本选区点 */
export type TextPoint = {
  id: string;
  type: typeof POINT_TYPE.TEXT;
  start: number;
  len: number;
};

/** 选区节点类型 */
export type RangeNode = BlockPoint | TextPoint;
