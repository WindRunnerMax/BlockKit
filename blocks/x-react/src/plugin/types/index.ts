import type { BlockContext, BlockWrapContext, TextWrapContext } from "@block-kit/x-core";

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

/**
 * 文本包裹状态
 */
export interface ReactTextWrapContext extends TextWrapContext {
  children?: React.ReactNode;
}
