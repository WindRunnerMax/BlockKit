import type { BlockContext, WrapContext } from "@block-kit/x-core";

/**
 * 块包装状态
 */
export interface ReactWrapContext extends WrapContext {
  children?: React.ReactNode;
}

/**
 * 块状态
 */
export interface ReactBlockContext extends BlockContext {
  children?: React.ReactNode;
}
