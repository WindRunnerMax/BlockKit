import { EDITOR_EVENT, EDITOR_STATE, Range } from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import type { ReactLeafContext } from "@block-kit/react";
import { EditorPlugin, Embed } from "@block-kit/react";
import type { EventContext } from "@block-kit/utils";
import { Bind, isKeyCode, KEY_CODE } from "@block-kit/utils";

import { SkillInput } from "../components/skill-input";
import { SKILL_KEY } from "../utils/constant";
import type { SkillPluginOptions } from "../utils/types";

export class SkillInputPlugin extends EditorPlugin {
  public key = SKILL_KEY;
  public options: SkillPluginOptions;

  constructor(options?: SkillPluginOptions) {
    super();
    this.options = options || { cleanable: true };
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN_CAPTURE, this.onKeydown);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onSelectionChange);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN_CAPTURE, this.onKeydown);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onSelectionChange);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[SKILL_KEY];
  }

  @Bind
  public onKeydown(e: KeyboardEvent, context: EventContext) {
    if (this.editor.state.isComposing()) return void 0;
    const sel = this.editor.selection.get();
    if (sel && sel.isCollapsed && isKeyCode(e, KEY_CODE.BACKSPACE)) {
      const leaf = this.editor.lookup.getLeafAtPoint(sel.start);
      if (leaf && leaf.op.attributes && leaf.op.attributes[SKILL_KEY]) {
        context.stop();
        e.preventDefault();
      }
      return void 0;
    }
    if (sel && sel.isCollapsed && isKeyCode(e, KEY_CODE.LEFT)) {
      const leaf = this.editor.lookup.getLeafAtPoint(sel.start);
      if (leaf && leaf.op.attributes && leaf.op.attributes[SKILL_KEY]) {
        context.stop();
        e.preventDefault();
      }
    }
  }

  @Bind
  public onSelectionChange() {
    if (this.editor.state.isComposing() || this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) {
      return void 0;
    }
    const firstLine = this.editor.state.block.getLine(0);
    const firstLeaf = firstLine && firstLine.getFirstLeaf();
    const sel = this.editor.selection.get();
    if (!firstLeaf || !sel) return void 0;
    const current = sel;
    if (
      current.start.line === 0 &&
      current.start.offset === 0 &&
      firstLeaf.op.attributes &&
      firstLeaf.op.attributes[SKILL_KEY]
    ) {
      const newStart = current.start.clone();
      newStart.offset = 1;
      this.editor.selection.set(new Range(newStart, current.end), true);
    }
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    context.classList.push("editable-skill-leaf");
    const { attributes: attrs = {} } = context;
    const value = attrs[SKILL_KEY] || "";
    return (
      <Embed context={context}>
        <SkillInput value={value} options={this.options} />
      </Embed>
    );
  }
}
