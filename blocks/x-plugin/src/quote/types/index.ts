import { st } from "../../shared/modules/shared-types";

export const QUOTE_KEY = "quote" as const;

export const DEFINE_QUOTE_TYPE = {
  type: st.string(QUOTE_KEY),
};

export type QuoteBlockDataType = st.infer<typeof DEFINE_QUOTE_TYPE>;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [QUOTE_KEY]: QuoteBlockDataType;
  }
}
