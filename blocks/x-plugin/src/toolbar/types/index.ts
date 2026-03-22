import type { Range } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";

export const TOOLBAR_KEY = "toolbar" as const;

export type ToolbarOptions = {
  offsetTop?: number;
  offsetLeft?: number;
};

export type ToolbarProps = {
  editor: BlockEditor;
  range: Range;
  left: number;
  top: number;
};

export type ToolbarFloatContext = {
  isMouseDown?: boolean;
  isWakeUp?: boolean;
};
