import type { P } from "@block-kit/utils/dist/es/types";
import type { Properties } from "csstype";

import type { BlockState } from "../../state/modules/block-state";

/**
 * 块包裹状态
 */
export type WrapContext = {
  classList: string[];
  blockState: BlockState;
  style: Properties<string | number>;
  children?: P.Any;
};

/**
 * 块渲染状态
 */
export type BlockContext = {
  key?: string;
  classList: string[];
  blockState: BlockState;
  style: Properties<string | number>;
};
