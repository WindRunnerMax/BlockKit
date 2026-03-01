import type { DeltaOp } from "@block-kit/x-json";

import { st } from "../../shared/modules/shared-types";

export const HEADING_KEY = "heading" as const;

export const DEFINE_HEADING_TYPE = {
  type: st.string(HEADING_KEY),
  delta: st.array<DeltaOp[]>([]),
  level: st.string("h1"),
};

export type HeadingBlockDataType = st.infer<typeof DEFINE_HEADING_TYPE>;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [HEADING_KEY]: HeadingBlockDataType;
  }
}
