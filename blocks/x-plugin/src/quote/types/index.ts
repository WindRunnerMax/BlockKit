export const QUOTE_KEY = "quote" as const;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [QUOTE_KEY]: {
      type: typeof QUOTE_KEY;
    };
  }
}
