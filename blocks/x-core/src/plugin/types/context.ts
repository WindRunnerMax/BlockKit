import type { P } from "@block-kit/utils/dist/es/types";
import type { Properties } from "csstype";

import type { BlockState } from "../../state/modules/block-state";

/**
 * 块包裹状态
 */
export type BlockWrapContext = {
  /** 状态对象 */
  state: BlockState;
  /**
   * 块包装类名列表
   * - 应用在 data-block 节点
   */
  classList: string[];
  /**
   * 样式对象
   * - 应用在 data-block 节点
   */
  style: Properties<string | number>;
  /** 子元素 */
  children?: P.Any;
};

/**
 * 块渲染状态
 */
export type BlockContext = {
  /** Key */
  key?: string;
  /** 状态对象 */
  state: BlockState;
  /**
   * 样式对象
   * - 应用在 data-block 节点
   */
  style: Properties<string | number>;
  /**
   * 块包装类名列表
   * - 应用在 data-block 节点
   */
  classList: string[];
  /**
   * 子元素类名列表
   * - 应用在 block-kit-x-children 节点
   */
  childClsList: string[];
};
