import type { BlockState } from "@block-kit/x-core";

export const NAVIGATOR_KEY = "navigator" as const;

export type NavigatorContext = {
  state: BlockState;
};
