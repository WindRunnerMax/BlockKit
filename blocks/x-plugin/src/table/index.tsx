import type { EventContext } from "@block-kit/utils";
import { Bind } from "@block-kit/utils";
import { EDITOR_EVENT } from "@block-kit/x-core";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { Table } from "./component/table";
import { Trs } from "./component/trs";
import { TABLE_KEY } from "./types/index";
import { onTableKeydown } from "./utils/keydown";

export class TableXPlugin extends BlockXPlugin {
  public key: string = TABLE_KEY;

  public constructor() {
    super();
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown, 90);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  @Bind
  public onKeydown(e: KeyboardEvent, context: EventContext): void {
    onTableKeydown(this.editor, e, context);
  }

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    const state = context.state;
    return (
      <Table state={state}>
        <Trs />
      </Table>
    );
  }
}
