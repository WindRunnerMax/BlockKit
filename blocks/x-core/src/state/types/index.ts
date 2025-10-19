import type { O } from "@block-kit/utils/dist/es/types";
import type { BlockChange } from "@block-kit/x-json";

export const EDITOR_STATE = {
  /** IME 组合状态 */
  COMPOSING: "COMPOSING",
  /** 挂载状态 */
  MOUNTED: "MOUNTED",
  /** 只读状态 */
  READONLY: "READONLY",
  /** 鼠标按键状态 */
  MOUSE_DOWN: "MOUSE_DOWN",
  /** 焦点状态(捕获) */
  FOCUS: "FOCUS",
  /** 焦点状态(冒泡) */
  FOCUSIN: "FOCUSIN",
  /** 渲染状态 */
  PAINTING: "PAINTING",
} as const;

export const APPLY_SOURCE = {
  /** 用户触发 默认值 */
  USER: "USER",
  /** 远程触发 协同值 */
  REMOTE: "REMOTE",
  /** History 模块触发 */
  HISTORY: "HISTORY",
};

/** Block 应用变更 */
export type ApplyChange = {
  /** Block ID */
  id: string;
  /** 变更组合 */
  ops: BlockChange;
};

export type ApplyOptions = {
  /** 操作源 */
  source?: O.Values<typeof APPLY_SOURCE>;
  /** 自动变换光标 */
  autoCaret?: boolean;
  /** 自动记录到 History */
  undoable?: boolean;
  /** 额外携带的信息 */
  extra?: unknown;
};

export type ApplyResult = {
  /** 操作 id */
  id: string;
};
