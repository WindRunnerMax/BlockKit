import type { Editor, PasteContext } from "@block-kit/core";
import type { CMDPayload } from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import { getOpLength } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { ReactLeafContext, ReactWrapLeafContext } from "@block-kit/react";
import { EditorPlugin } from "@block-kit/react";
import { InjectWrapKeys } from "@block-kit/react";
import { Bind } from "@block-kit/utils";

import { LINK_BLANK_KEY, LINK_KEY, LINK_TEMP_KEY } from "./types";
import { LINK_REG } from "./utils/constant";
import { A } from "./view/a";

export class LinkPlugin extends EditorPlugin {
  public key = LINK_KEY;
  protected modal: HTMLDivElement | null;

  constructor(protected editor: Editor) {
    super();
    this.modal = null;
    editor.command.register(this.key, this.onExec);
  }

  public destroy(): void {
    this.modal && this.modal.remove();
    this.modal = null;
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[LINK_KEY] || !!attrs[LINK_TEMP_KEY];
  }

  @Bind
  public onExec(payload: CMDPayload) {
    const range = this.editor.selection.get() || payload.range;
    const attrs = payload.attrs;
    if (!range || attrs) {
      return void 0;
    }
  }

  public willApplyPasteDelta(context: PasteContext): PasteContext {
    const delta = context.delta;
    const changes = new Delta();
    for (const op of delta.ops) {
      const len = getOpLength(op);
      // 粘贴文本内容自动应用为超链接状态
      let res: RegExpExecArray | null = null;
      if (op.insert && (res = LINK_REG.exec(op.insert))) {
        const link = res[0];
        changes.retain(link.length, { [LINK_KEY]: link, [LINK_BLANK_KEY]: "true" });
        changes.retain(len - link.length);
        continue;
      }
      changes.retain(len);
    }
    context.delta = delta.compose(changes);
    return context;
  }

  @InjectWrapKeys(LINK_KEY)
  public wrapLeaf(context: ReactWrapLeafContext): React.ReactNode {
    return <span className="block-kit-hyper-link-wrap">{context.children}</span>;
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const attrs = context.attributes;
    if (!attrs) {
      return context.children;
    }
    if (attrs[LINK_TEMP_KEY]) {
      context.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    }
    if (!attrs[LINK_KEY]) {
      return context.children;
    }
    return <A attrs={attrs}>{context.children}</A>;
  }
}
