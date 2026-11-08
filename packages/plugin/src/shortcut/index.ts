import type { Editor } from "@block-kit/core";
import { CorePlugin, EDITOR_EVENT } from "@block-kit/core";
import type { Op } from "@block-kit/delta";
import { Bind } from "@block-kit/utils";
import type { F, O } from "@block-kit/utils/dist/es/types";

import { PLUGIN_EVENTS } from "../shared/utils/event";
import { filterLineMarkMap, filterMarkMap } from "../toolbar/utils/marks";
import { PRESET_SHORTCUT } from "./modules/preset";
import type { ShortcutFunc, ShortcutFuncMap } from "./types";
import { SHORTCUT_KEY } from "./types";

export class Shortcut extends CorePlugin {
  public key = SHORTCUT_KEY;
  protected config: ShortcutFunc[];

  public constructor(protected editor: Editor, config?: ShortcutFuncMap) {
    super();
    this.config = Object.values({ ...PRESET_SHORTCUT, ...config });
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown, 1000);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  public match(): boolean {
    return false;
  }

  protected getKeys(): O.Map<string> {
    const current = this.editor.selection.get();
    if (!current) {
      return {};
    }
    const lines = this.editor.state.block.getLines();
    const { start, end } = current;
    const lineMarkMap = filterLineMarkMap(
      lines.slice(start.line, end.line + 1).map(line => line.attributes)
    );
    if (current.isCollapsed) {
      return { ...this.editor.lookup.marks, ...lineMarkMap };
    }
    const ops: Op[] = [];
    if (current.isCollapsed) {
      const op = this.editor.lookup.getOpAtPoint(current.start);
      op && ops.push(op);
    } else {
      const fragment = this.editor.lookup.getFragment();
      fragment && ops.push(...fragment);
    }
    const markMap = filterMarkMap(ops);
    return { ...markMap, ...lineMarkMap };
  }

  @Bind
  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return void 0;
    const keys = this.getKeys();
    const payload: F.Args<ShortcutFunc>["1"] = {
      keys,
      editor: this.editor,
      sel: this.editor.selection.get(),
    };
    for (const func of this.config) {
      const result = func(event, payload);
      if (!result) continue;
      this.editor.event.trigger(PLUGIN_EVENTS.SHORTCUT_MARKS_CHANGE, null);
      break;
    }
  }
}
