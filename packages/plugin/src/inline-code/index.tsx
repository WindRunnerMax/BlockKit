import "./styles/index.scss";

import type { Editor, LineState, SerializeContext } from "@block-kit/core";
import { Priority } from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import type { ReactLeafContext } from "@block-kit/react";
import { EditorPlugin } from "@block-kit/react";
import type { ReactNode } from "react";

import { INLINE_CODE_END_CLASS, INLINE_CODE_KEY, INLINE_CODE_START_CLASS } from "./types";

export class InlineCodePlugin extends EditorPlugin {
  public key = INLINE_CODE_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(INLINE_CODE_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [INLINE_CODE_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[INLINE_CODE_KEY];
  }

  public serialize(context: SerializeContext): SerializeContext {
    const { op, html } = context;
    if (op.attributes && op.attributes[INLINE_CODE_KEY]) {
      const strong = document.createElement("code");
      strong.appendChild(html);
      context.html = strong;
    }
    return context;
  }

  public didPaintLineState(lineState: LineState): void {
    const leaves = lineState.getLeaves();
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      if (!leaf.op.attributes || !leaf.op.attributes[INLINE_CODE_KEY]) {
        continue;
      }
      const prev = leaves[i - 1];
      const next = leaves[i + 1];
      const node = leaf.getDOMNode();
      if (!prev || !prev.op.attributes || !prev.op.attributes[INLINE_CODE_KEY]) {
        node && node.classList.add(INLINE_CODE_START_CLASS);
      } else {
        node && node.classList.remove(INLINE_CODE_START_CLASS);
      }
      if (!next || !next.op.attributes || !next.op.attributes[INLINE_CODE_KEY]) {
        node && node.classList.add(INLINE_CODE_END_CLASS);
      } else {
        node && node.classList.remove(INLINE_CODE_END_CLASS);
      }
    }
  }

  @Priority(100)
  public renderLeaf(context: ReactLeafContext): ReactNode {
    const leaf = context.leafState;
    const prev = leaf.prev();
    const next = leaf.next();
    if (!prev || !prev.op.attributes || !prev.op.attributes[INLINE_CODE_KEY]) {
      context.classList.push(INLINE_CODE_START_CLASS);
    }
    context.classList.push("block-kit-inline-code");
    if (!next || !next.op.attributes || !next.op.attributes[INLINE_CODE_KEY]) {
      context.classList.push(INLINE_CODE_END_CLASS);
    }
    return context.children;
  }
}
