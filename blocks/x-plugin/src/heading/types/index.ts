import type { Op } from "@block-kit/delta";

export const HEADING_KEY = "heading" as const;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [HEADING_KEY]: {
      type: typeof HEADING_KEY;
      align?: string;
      delta: Op[];
    };
  }
}
