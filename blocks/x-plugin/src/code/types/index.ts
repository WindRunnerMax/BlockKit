import type { DeltaOp } from "@block-kit/x-json";

import { st } from "../../shared/modules/shared-types";

export const CODE_KEY = "code" as const;

export const DEFINE_CODE_TYPE = {
  type: st.string(CODE_KEY),
  language: st.string(),
  delta: st.array<DeltaOp[]>([]),
};

export type CodeBlockDataType = st.infer<typeof DEFINE_CODE_TYPE>;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [CODE_KEY]: CodeBlockDataType;
  }
}
