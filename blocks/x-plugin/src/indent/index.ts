import { Bind, isKeyCode, KEY_CODE } from "@block-kit/utils";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { BlockXPlugin } from "@block-kit/x-react";

import { INDENT_KEY } from "./types";

export class IndentXPlugin extends BlockXPlugin {
  public key: string = INDENT_KEY;

  constructor() {
    super();
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  @Bind
  public onKeyDown(event: KeyboardEvent): void {
    if (!isKeyCode(event, KEY_CODE.TAB)) return void 0;
    event.preventDefault();
    const sel = this.editor.selection.get();
    if (!sel) return void 0;
    event.shiftKey ? this.editor.perform.unindent(sel) : this.editor.perform.indent(sel);
  }
}
