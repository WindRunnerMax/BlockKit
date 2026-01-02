import type { F, O } from "@block-kit/utils/dist/es/types";

import type { CorePlugin } from "../modules/implement";

export type PluginType = keyof CorePlugin;
export type RequiredPlugin = Required<CorePlugin>;
export type CallerType = O.Values<typeof CALLER_TYPE>;

/** 插件批量调用方法 */
export const CALLER_TYPE = {
  SERIALIZE: "serialize",
  DESERIALIZE: "deserialize",
  WILL_SET_CLIPBOARD: "willSetToClipboard",
  WILL_PASTE_DELTAS: "willApplyPasteDelta",
  WILL_PAINT_BLOCK_STATE: "willPaintBlockState",
  DID_PAINT_BLOCK_STATE: "didPaintBlockState",
} as const;

/** 插件原型方法 */
export const PLUGIN_FUNC = {
  ...CALLER_TYPE,
  RENDER_BLOCK: "renderBlock",
  RENDER_TEXT_WRAP: "renderTextWrap",
  RENDER_BLOCK_WRAP: "renderBlockWrap",
} as const;

export type CallerMap = {
  [P in CallerType]: PickPluginFunc<P>;
};

export type PluginFuncKeys = Exclude<
  O.Values<{
    [key in PluginType]: RequiredPlugin[key] extends F.Any ? key : never;
  }>,
  "destroy"
>;

export type PickPluginFunc<key extends PluginType> = RequiredPlugin[key] extends F.Any
  ? Parameters<RequiredPlugin[key]>[0]
  : null;

export type PluginRequiredKeyFunc<T extends PluginFuncKeys> = CorePlugin &
  Required<{
    [K in T]: RequiredPlugin[K];
  }>;
