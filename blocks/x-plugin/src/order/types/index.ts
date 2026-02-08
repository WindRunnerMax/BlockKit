import type { F, O } from "@block-kit/utils/dist/es/types";
import type { DeltaOp } from "@block-kit/x-json";

export const ORDER_KEY = "order" as const;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [ORDER_KEY]: {
      type: typeof ORDER_KEY;
      /**
       * 列表项的起始序号
       * - 值为 -1 表示 auto
       * - 值为 >=1 表示从指定序号开始
       */
      start: number;
      align?: string;
      delta: DeltaOp[];
    };
  }
}

export type XOrderStore = O.Map<{
  start: number;
  update: F.Plain;
}>;
