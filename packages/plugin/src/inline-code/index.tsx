import "./styles/index.scss";

import type { Editor, SerializeContext } from "block-kit-core";
import { Priority } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { INLINE_CODE } from "./types";

export class InlineCodePlugin extends EditorPlugin {
  public key = INLINE_CODE;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(INLINE_CODE, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [INLINE_CODE]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[INLINE_CODE];
  }

  public serialize(context: SerializeContext): SerializeContext {
    const { op, html } = context;
    if (op.attributes && op.attributes[INLINE_CODE]) {
      const strong = document.createElement("code");
      strong.appendChild(html);
      context.html = strong;
    }
    return context;
  }

  @Priority(100)
  public renderLeaf(context: ReactLeafContext): ReactNode {
    const leaf = context.leafState;
    const prev = leaf.prev(false);
    const next = leaf.next(false);
    if (!prev || !prev.op.attributes || !prev.op.attributes[INLINE_CODE]) {
      context.classList.push("block-kit-inline-code-start");
    }
    context.classList.push("block-kit-inline-code");
    if (!next || !next.op.attributes || !next.op.attributes[INLINE_CODE]) {
      context.classList.push("block-kit-inline-code-end");
    }
    return context.children;
  }
}
