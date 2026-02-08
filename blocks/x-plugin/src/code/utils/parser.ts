// eslint-disable-next-line simple-import-sort/imports
import Prism from "prismjs";
import "prismjs/themes/prism.min.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import { CODE_HL_KEY, DEFAULT_LANGUAGE } from "./constant";
import { Delta, getOpLength } from "@block-kit/delta";
import { isNil, isString, NIL } from "@block-kit/utils";
import { Point } from "@block-kit/x-core";
import type { BlockState, BlockEditor, RangePoint } from "@block-kit/x-core";

export const tokenize = (code: string, language: string) => {
  const delta = new Delta();
  if (language === DEFAULT_LANGUAGE) {
    delta.retain(code.length, { [CODE_HL_KEY]: NIL });
    return delta;
  }
  const tokens = Prism.tokenize(code, Prism.languages[language.toLowerCase()]);
  for (const token of tokens) {
    if (!isString(token)) {
      const length = token.content.length;
      delta.retain(length, { [CODE_HL_KEY]: token.type });
    } else {
      delta.retain(token.length, { [CODE_HL_KEY]: NIL });
    }
  }
  return delta;
};

export const restoreSelectionMarks = (editor: BlockEditor, state: BlockState, delta: Delta) => {
  const selection = editor.selection.get();
  let point: RangePoint | null = null;
  if (
    selection &&
    selection.isCollapsed &&
    (point = selection.getFirstPoint()) &&
    point.id === state.id &&
    Point.isText(point)
  ) {
    let start = point.offset;
    for (const op of delta.ops) {
      const len = getOpLength(op);
      start = start - len;
      if (start > 0) continue;
      const attrs = op.attributes || {};
      const mark = attrs[CODE_HL_KEY];
      !isNil(mark) && (editor.lookup.marks[CODE_HL_KEY] = mark);
      return void 0;
    }
  }
};
