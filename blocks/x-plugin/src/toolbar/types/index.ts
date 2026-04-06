import type { Range } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";

import type { RenderToolbarContext } from "../utils/schedule";

export const TOOLBAR_KEY = "toolbar" as const;

declare module "@block-kit/x-react/dist/es/plugin" {
  export interface BlockXPlugin {
    renderToolbar?(context: RenderToolbarContext): React.ReactNode;
  }
}

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
