import { Bind } from "@block-kit/utils";
import type { SelectionChangeEvent } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { BlockXPlugin, MountNode } from "@block-kit/x-react";

import { Toolbar } from "./context/provider";
import type { ToolbarFloatContext, ToolbarOptions } from "./types/index";
import { TOOLBAR_KEY } from "./types/index";

export class ToolbarXPlugin extends BlockXPlugin {
  public key: string = TOOLBAR_KEY;
  protected context: ToolbarFloatContext;

  public constructor(protected options: ToolbarOptions = {}) {
    super();
    this.context = {
      isWakeUp: false,
      isMouseDown: false,
    };
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN_GLOBAL, this.onMouseDown);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUp);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN_GLOBAL, this.onMouseDown);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUp);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public onCaretWeakUp() {
    const state = this.editor.state;
    const isFocused = state.isFocused();
    const isReadonly = state.isReadonly();
    const isWakeUp = this.context.isWakeUp;
    const isMouseDown = this.context.isMouseDown;
    WAKE_UP: if (!isReadonly && isFocused && !isMouseDown && isWakeUp) {
      const range = this.editor.selection.get();
      const rect = this.editor.rect.getCaretRect();
      if (!range || !rect) break WAKE_UP;
      const topOffset = this.options.offsetTop || 0;
      const leftOffset = this.options.offsetLeft || 0;
      const t = rect.top + topOffset;
      const l = rect.left + rect.width / 2 + leftOffset;
      const el = <Toolbar range={range} left={l} top={t} editor={this.editor} />;
      MountNode.mount(this.editor, this.key, el);
      return void 0;
    }
    MountNode.unmount(this.editor, this.key);
  }

  @Bind
  protected onMouseDown(event: MouseEvent) {
    // 避免浮动工具栏的快速重置
    if (event.detail === 3) return void 0;
    this.context.isMouseDown = true;
    this.onCaretWeakUp();
  }

  @Bind
  protected onMouseUp() {
    this.context.isMouseDown = false;
    this.onCaretWeakUp();
  }

  @Bind
  protected onSelectionChange(e: SelectionChangeEvent) {
    const { current } = e;
    const isWakeUp = current ? !current.isCollapsed : false;
    this.context.isWakeUp = isWakeUp;
    this.onCaretWeakUp();
  }
}
