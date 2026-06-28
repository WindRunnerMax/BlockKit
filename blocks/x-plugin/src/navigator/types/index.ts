import { PRIORITY_KEY } from "@block-kit/core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";

export const NAVIGATOR_KEY = "navigator" as const;
export const NAV_PRIORITY_KEY = `${PRIORITY_KEY}renderNavigator`;

export type NavigatorContext = ReactBlockWrapContext;

export type NavigatorPlugin = {
  [NAV_PRIORITY_KEY]?: number;
  renderNavigator: () => NavigatorResult;
};

export type NavigatorResult = {
  icon?: (context: NavigatorContext) =>
    | {
        el: React.ReactNode;
        className?: string;
        position?: "left" | "lt";
        popupAlign?: { top: number; left: number };
      }
    /** 表示需要隐藏 */
    | null
    | undefined;
  simple?: (context: NavigatorContext) => React.ReactNode | null;
  menu?: (context: NavigatorContext) => React.ReactNode | null;
};
