import { Point, Range, RawPoint } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { CTRL_KEY, KEY_CODE, NIL, TRULY } from "@block-kit/utils";
import type { O } from "@block-kit/utils/dist/es/types";

import { BOLD_KEY } from "../../bold/types";
import { BULLET_LIST_KEY, LIST_TYPE_KEY } from "../../bullet-list/types";
import { DIVIDER_KEY } from "../../divider/types";
import { HEADING_KEY } from "../../heading/types";
import { ITALIC_KEY } from "../../italic/types";
import { ORDER_LIST_KEY } from "../../order-list/types";
import { QUOTE_KEY } from "../../quote/types";
import { isKeyCode } from "../../shared/utils/is";
import type { ShortcutFuncMap } from "../types";
import { matchLineMarker } from "../utils/marker";

export const PRESET_SHORTCUT: ShortcutFuncMap = {
  [BOLD_KEY]: (event, payload) => {
    if (event[CTRL_KEY] && isKeyCode(event, KEY_CODE.B) && payload.sel) {
      const { editor, keys, sel } = payload;
      editor.perform.applyMarks(sel, { [BOLD_KEY]: keys[BOLD_KEY] ? NIL : TRULY });
      return true;
    }
  },
  [ITALIC_KEY]: (event, payload) => {
    if (event[CTRL_KEY] && isKeyCode(event, KEY_CODE.I) && payload.sel) {
      const { editor, keys, sel } = payload;
      editor.perform.applyMarks(sel, { [ITALIC_KEY]: keys[ITALIC_KEY] ? NIL : TRULY });
      return true;
    }
  },
  [LIST_TYPE_KEY]: (event, payload) => {
    if (isKeyCode(event, KEY_CODE.SPACE) && payload.sel) {
      const { editor, sel } = payload;
      // 行首为 `1.` / `-` / `*` 且光标仍在标记区时, 转换为对应的列表类型
      const match = matchLineMarker(editor, sel, ["1.", "-", "*"]);
      if (!match) return void 0;
      editor.perform.deleteForward(
        Range.fromTuple([sel.start.line, 0], [sel.start.line, match.marker.length])
      );
      const key = match.marker === "1." ? ORDER_LIST_KEY : BULLET_LIST_KEY;
      editor.command.exec(key, { value: TRULY });
      event.preventDefault();
      return true;
    }
  },
  [DIVIDER_KEY]: (event, payload) => {
    if (isKeyCode(event, KEY_CODE.SPACE) && payload.sel && payload.sel.isCollapsed) {
      const { editor, sel } = payload;
      const line = editor.state.block.getLine(sel.start.line);
      const firstLeaf = line && line.getFirstLeaf();
      const text = firstLeaf && firstLeaf.getText();
      if (text === "---") {
        editor.perform.deleteForward(
          Range.fromTuple([sel.start.line, 0], [sel.start.line, text.length])
        );
        const start = RawPoint.fromPoint(editor, new Point(sel.start.line, 0));
        if (!start) return void 0;
        const delta = new Delta().retain(start.offset).insert(" ", { [DIVIDER_KEY]: TRULY });
        editor.state.apply(delta, { preventNormalize: true });
        event.preventDefault();
        return true;
      }
    }
  },
  [QUOTE_KEY]: (event, payload) => {
    if (isKeyCode(event, KEY_CODE.SPACE) && payload.sel) {
      const { editor, sel } = payload;
      // 行首为 `>` 且光标仍在标记区时, 转换为引用
      const match = matchLineMarker(editor, sel, [">"]);
      if (!match) return void 0;
      editor.perform.deleteForward(
        Range.fromTuple([sel.start.line, 0], [sel.start.line, match.marker.length])
      );
      editor.command.exec(QUOTE_KEY, { value: TRULY });
      event.preventDefault();
      return true;
    }
  },
  [HEADING_KEY]: (event, payload) => {
    if (isKeyCode(event, KEY_CODE.SPACE) && payload.sel) {
      const { editor, sel } = payload;
      // 行首为 `#` 系列且光标仍在标记区时, 转换为对应级别的标题
      const HEADING_MAP: O.Map<string> = {
        "#": "1",
        "##": "2",
        "###": "3",
      };
      const match = matchLineMarker(editor, sel, Object.keys(HEADING_MAP));
      if (!match) return void 0;
      editor.perform.deleteForward(
        Range.fromTuple([sel.start.line, 0], [sel.start.line, match.marker.length])
      );
      editor.command.exec(HEADING_KEY, { value: "h" + HEADING_MAP[match.marker] });
      event.preventDefault();
      return true;
    }
  },
};
