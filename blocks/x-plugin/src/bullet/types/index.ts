import type { DeltaOp } from "@block-kit/x-json";

import { st } from "../../shared/modules/shared-types";

export const BULLET_KEY = "bullet" as const;

export const DEFINE_BULLET_TYPE = {
  type: st.string(BULLET_KEY),
  delta: st.array<DeltaOp[]>([]),
};

export type BulletBlockDataType = st.infer<typeof DEFINE_BULLET_TYPE>;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [BULLET_KEY]: BulletBlockDataType;
  }
}
