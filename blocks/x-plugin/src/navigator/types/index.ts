import type { ReactBlockWrapContext } from "@block-kit/x-react";

export const NAVIGATOR_KEY = "navigator" as const;

export type NavigatorContext = ReactBlockWrapContext;

export type NavigatorResult =
  | {
      icon?: {
        el: React.ReactNode;
        className?: string;
        position?: "left" | "lt";
        popupAlign?: { top: number; left: number };
      } | null;
      simple?: React.ReactNode | null;
      menu?: React.ReactNode | null;
    }
  | null
  | undefined;
