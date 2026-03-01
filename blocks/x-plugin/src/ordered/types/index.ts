import type { F, O } from "@block-kit/utils/dist/es/types";
import type { DeltaOp } from "@block-kit/x-json";

import { st } from "../../shared/modules/shared-types";

export const ORDERED_KEY = "ordered" as const;

export const DEFINE_ORDERED_TYPE = {
  type: st.string(ORDERED_KEY),
  /**
   * 列表项的起始序号
   * - 值为 -1 表示 auto
   * - 值为 >=1 表示从指定序号开始
   */
  start: st.number(-1),
  delta: st.array<DeltaOp[]>([]),
};

export type OrderBlockDataType = st.infer<typeof DEFINE_ORDERED_TYPE>;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [ORDERED_KEY]: OrderBlockDataType;
  }
}

export type XOrderStore = O.Map<{
  start: number;
  update: F.Plain;
}>;
