import type { BlockContext, BlockWrapContext } from "@block-kit/x-core";

/**
 * 块状态
 */
export interface ReactBlockContext extends BlockContext {
  children?: React.ReactNode;
}

/**
 * 块包装状态
 */
export interface ReactBlockWrapContext extends BlockWrapContext {
  children?: React.ReactNode;
}
