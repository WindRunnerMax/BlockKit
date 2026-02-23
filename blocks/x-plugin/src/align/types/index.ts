export const ALIGN_KEY = "align" as const;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface GenericBlock {
    [ALIGN_KEY]?: string;
  }
}
