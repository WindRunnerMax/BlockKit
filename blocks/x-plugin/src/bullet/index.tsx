import type { EventContext } from "@block-kit/utils";
import { Bind } from "@block-kit/utils";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { Point } from "@block-kit/x-core";
import type { ReactBlockContext, ReactBlockWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { inheritLineProperties } from "../shared/utils/input";
import { BULLET_KEY } from "./types/index";
import { BulletText } from "./view/bullet";

export class BulletXPlugin extends BlockXPlugin {
  public key: string = BULLET_KEY;

  public constructor() {
    super();
    this.editor.event.on(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput, 99);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
  }

  @Bind
  protected onBeforeInput(e: InputEvent, context: EventContext) {
    const sel = this.editor.selection.get();
    const firstPoint = sel && sel.getFirstPoint();
    if (firstPoint && Point.isText(firstPoint)) {
      const state = this.editor.state.getBlock(firstPoint.id);
      if (!state || state.type !== BULLET_KEY) return void 0;
      const data = state.data;
      inheritLineProperties(this.editor, e, context, sel, data);
    }
  }

  public renderTextWrap(context: ReactBlockWrapContext): React.ReactNode {
    const state = context.state;
    if (state.type !== BULLET_KEY) return context.children;
    return <BulletText context={context}>{context.children}</BulletText>;
  }

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    context.childClsList.push("block-kit-x-bullet-children");
    return context.children;
  }
}
