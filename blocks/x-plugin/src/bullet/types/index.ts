import type { DeltaOp } from "@block-kit/x-json";

export const BULLET_KEY = "bullet" as const;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [BULLET_KEY]: {
      type: typeof BULLET_KEY;
      align?: string;
      delta: DeltaOp[];
    };
  }
}
