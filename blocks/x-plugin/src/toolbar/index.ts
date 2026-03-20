import { Bind } from "@block-kit/utils";
import type { SelectionChangeEvent } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { BlockXPlugin } from "@block-kit/x-react";

import type { ToolbarFloatContext } from "./types/index";
import { TOOLBAR_KEY } from "./types/index";

export class ToolbarXPlugin extends BlockXPlugin {
  public key: string = TOOLBAR_KEY;
  protected context: ToolbarFloatContext = {};

  public constructor() {
    super();
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN_GLOBAL, this.onMouseDown);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUp);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN_GLOBAL, this.onMouseDown);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUp);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  @Bind
  public onMouseDown(e: MouseEvent) {
    console.log("e :>> ", e);
  }

  @Bind
  public onMouseUp(e: MouseEvent) {
    console.log("e :>> ", e);
  }

  @Bind
  public onSelectionChange(e: SelectionChangeEvent) {
    console.log("e :>> ", e);
  }
}
