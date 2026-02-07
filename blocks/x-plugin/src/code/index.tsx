import { Delta } from "@block-kit/delta";
import { preventContextEvent } from "@block-kit/plugin";
import type { EventContext } from "@block-kit/utils";
import { Bind, isKeyCode, KEY_CODE } from "@block-kit/utils";
import type { CreateTextEditorContext, TextEditor } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { Entry } from "@block-kit/x-core";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { createComplexTextEditor } from "../shared/utils/text";
import { CODE_KEY } from "./types";
import { CodeHLPlugin } from "./utils/hl-plugin";
import { CodeBlock } from "./view/code-block";

export class CodeXPlugin extends BlockXPlugin {
  public key: string = CODE_KEY;

  public constructor() {
    super();
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  @Bind
  public onKeydown(e: KeyboardEvent, context: EventContext): void {
    if (!isKeyCode(e, KEY_CODE.ENTER) || e.isComposing) return void 0;
    const sel = this.editor.selection.get();
    const first = sel && sel.length === 1 && sel.at(0);
    if (!first || Entry.isBlock(first)) return void 0;
    const id = first.id;
    const state = this.editor.state.getBlock(id);
    if (!state || state.type !== CODE_KEY) return void 0;
    const delta = new Delta().retain(first.start).delete(first.len).insertEOL();
    const change = this.editor.perform.atom.updateText(id, delta);
    this.editor.state.apply([change]);
    preventContextEvent(e, context);
  }

  public willCreateTextEditor(context: CreateTextEditorContext): TextEditor {
    return createComplexTextEditor(context, {
      registerHook: () => [new CodeHLPlugin()],
    });
  }

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    return <CodeBlock editor={this.editor} context={context}></CodeBlock>;
  }
}
