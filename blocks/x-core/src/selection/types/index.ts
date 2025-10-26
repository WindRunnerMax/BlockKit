import type { O } from "@block-kit/utils/dist/es/types";

import type { POINT_TYPE } from "../utils/constant";

export type PointType = O.Values<typeof POINT_TYPE>;

export type BlockPoint = {
  id: string;
  type: typeof POINT_TYPE.BLOCK;
};

export type TextPoint = {
  id: string;
  type: typeof POINT_TYPE.TEXT;
  start: number;
  len: number;
};

export type RangeNode = BlockPoint | TextPoint;
