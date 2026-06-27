import type { ReactBlockWrapContext } from "@block-kit/x-react";

export const NAVIGATOR_KEY = "navigator" as const;

export type NavigatorContext = ReactBlockWrapContext;

export type NavigatorResult =
  | {
      icon?: { el: React.ReactNode; className?: string } | null;
      simple?: React.ReactNode | null;
      menu?: React.ReactNode | null;
    }
  | null
  | undefined;
