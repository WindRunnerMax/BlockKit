import type { DeltaOp } from "@block-kit/x-json";

export const CODE_KEY = "code";

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [CODE_KEY]: {
      type: typeof CODE_KEY;
      language?: string;
      delta: DeltaOp[];
    };
  }
}
