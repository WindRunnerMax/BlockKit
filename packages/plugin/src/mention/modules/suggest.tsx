import type { Editor, SelectionChangeEvent } from "@block-kit/core";
import { EDITOR_EVENT, Point, Range, relativeTo } from "@block-kit/core";
import { Delta, deltaToText } from "@block-kit/delta";
import { MountNode } from "@block-kit/react";
import { Bind, KEY_CODE } from "@block-kit/utils";

import { isKeyCode } from "../../shared/utils/is";
import { MENTION_KEY } from "../types";
import { PANEL_HEIGHT, SUGGEST_OFFSET } from "../utils/constant";
import { Suggest } from "../view/suggest";

export class SuggestModule {
  public point: Point;
  public isMountSuggest: boolean;
  public rect: { top: number; left: number } | null;

  constructor(public editor: Editor) {
    this.rect = null;
    this.isMountSuggest = false;
    this.point = new Point(0, 0);
    editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown, 101);
  }

  public destroy(): void {
    this.unmountSuggestPanel();
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  @Bind
  public onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return void 0;
    if (isKeyCode(event, KEY_CODE.D2) && event.shiftKey) {
      const sel = this.editor.selection.get();
      const caretRect = this.editor.rect.getRawCaretRect();
      if (!caretRect || !sel) return void 0;
      const editorRect = this.editor.rect.getEditorRect();
      const rect = relativeTo(caretRect, editorRect);
      if (caretRect.bottom + PANEL_HEIGHT <= window.innerHeight) {
        // 放置于下方
        rect.top = rect.bottom + SUGGEST_OFFSET;
      } else {
        // 放置于上方
        rect.top = rect.top - PANEL_HEIGHT - SUGGEST_OFFSET;
      }
      this.rect = { top: rect.top, left: rect.left };
      this.point = sel.start.clone();
      this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
    }
    if (this.isMountSuggest && isKeyCode(event, KEY_CODE.ESC)) {
      this.unmountSuggestPanel();
    }
  }

  @Bind
  public onSelectionChange(event: SelectionChangeEvent): void {
    const { current } = event;
    if (
      !current ||
      !current.isCollapsed ||
      current.start.line !== this.point.line ||
      current.start.offset <= this.point.offset
    ) {
      this.unmountSuggestPanel();
      return void 0;
    }
    const ops = this.editor.lookup.getFragment(new Range(this.point, current.end));
    if (!ops) return void 0;
    const text = deltaToText(new Delta(ops));
    this.mountSuggestPanel(text.slice(1));
  }

  public mountSuggestPanel(text: string = "") {
    if (!this.rect) return void 0;
    const top = this.rect.top;
    const left = this.rect.left;
    this.isMountSuggest = true;
    MountNode.mount(
      this.editor,
      MENTION_KEY,
      <Suggest controller={this} top={top} left={left} text={text} />
    );
  }

  public unmountSuggestPanel() {
    MountNode.unmount(this.editor, MENTION_KEY);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
    this.isMountSuggest = false;
  }
}
