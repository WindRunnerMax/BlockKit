import type { EventContext } from "@block-kit/utils";
import { Bind } from "@block-kit/utils";
import { EDITOR_EVENT, Point } from "@block-kit/x-core";
import type { BlockDataType } from "@block-kit/x-json";
import type { ReactBlockContext, ReactBlockWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { inheritLineProperties } from "../shared/utils/input";
import type { XOrderStore } from "./types/index";
import { ORDER_KEY } from "./types/index";
import { updateNewOrderList } from "./utils/serial";
import { OrderText } from "./view/order";

export class OrderXPlugin extends BlockXPlugin {
  public key: string = ORDER_KEY;
  public store: XOrderStore = {};

  public constructor() {
    super();
    this.editor.event.on(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput, 99);
  }

  public destroy(): void {
    this.store = {};
    this.editor.event.off(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
  }

  @Bind
  protected onBeforeInput(e: InputEvent, context: EventContext) {
    const sel = this.editor.selection.get();
    const firstPoint = sel && sel.getFirstPoint();
    if (firstPoint && Point.isText(firstPoint)) {
      const state = this.editor.state.getBlock(firstPoint.id);
      if (!state || state.type !== ORDER_KEY) return void 0;
      const data = { ...state.data } as BlockDataType<"order">;
      data.start = -1;
      inheritLineProperties(this.editor, e, context, sel, data);
      updateNewOrderList(this.store, state);
      const nextSel = this.editor.selection.get();
      const selFirstPoint = nextSel && nextSel.getFirstPoint();
      const selBlock = selFirstPoint && this.editor.state.getBlock(selFirstPoint.id);
      selBlock && updateNewOrderList(this.store, selBlock);
    }
  }

  public renderTextWrap(context: ReactBlockWrapContext): React.ReactNode {
    const state = context.state;
    if (state.data.type !== ORDER_KEY) return context.children;
    const start = state.data.start || -1;
    return (
      <OrderText start={start} store={this.store} context={context}>
        {context.children}
      </OrderText>
    );
  }

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    context.childClsList.push("block-kit-x-order-children");
    return context.children;
  }
}
