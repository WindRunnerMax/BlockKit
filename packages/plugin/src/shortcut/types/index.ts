import type { Editor } from "@block-kit/core";
import type { Range } from "@block-kit/core";
import type { O, P } from "@block-kit/utils/dist/es/types";

export const SHORTCUT_KEY = "SHORTCUT_KEY";

/**
 * 快捷键处理函数
 * @param event 键盘事件
 * @param payload 携带参数
 * @returns - true 表示匹配成功并阻止后续处理
 *          - 否则继续执行后续快捷键逻辑
 */
export type ShortcutFunc = (
  event: KeyboardEvent,
  payload: {
    editor: Editor;
    keys: O.Map<string>;
    sel: Range | null;
  }
) => true | P.Nil;

/** 预设快捷键集合 */
export type ShortcutFuncMap = O.Map<ShortcutFunc>;
