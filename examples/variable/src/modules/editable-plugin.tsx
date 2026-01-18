import type { LeafState } from "@block-kit/core";
import { EDITOR_EVENT, isArrowRight } from "@block-kit/core";
import { isArrowLeft } from "@block-kit/core";
import type { AttributeMap } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { ReactLeafContext } from "@block-kit/react";
import { EditorPlugin, Embed } from "@block-kit/react";
import type { EventContext } from "@block-kit/utils";
import { cs, isKeyCode, KEY_CODE } from "@block-kit/utils";
import { Bind, isDOMText } from "@block-kit/utils";

import { EditableTextInput } from "../components/editable-input";
import { DATA_EDITABLE_KEY, VARS_CLS_PREFIX, VARS_KEY, VARS_VALUE_KEY } from "../utils/constant";
import { onLeftArrowKey, onRightArrowKey, onTabKey } from "../utils/event";
import type { EditablePluginOptions as EditableInputOptions } from "../utils/types";

export class EditableInputPlugin extends EditorPlugin {
  public key = VARS_KEY;
  public options: EditableInputOptions;

  constructor(options?: EditableInputOptions) {
    super();
    this.options = options || {};
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown, 10);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[VARS_KEY];
  }

  @Bind
  public onKeyDown(event: KeyboardEvent, context: EventContext) {
    const sel = this.editor.selection.get();
    const selection = window.getSelection();
    if (!sel || !sel.isCollapsed || !selection) {
      return void 0;
    }
    if (!isArrowRight(event) && !isArrowLeft(event)) {
      return void 0;
    }
    const leaf = this.editor.lookup.getLeafAtPoint(sel.start);
    const nextLeaf = leaf && leaf.next();
    if (
      isArrowRight(event) &&
      nextLeaf &&
      nextLeaf.embed &&
      leaf &&
      sel.start.offset === leaf.offset + leaf.length &&
      nextLeaf.op.attributes &&
      nextLeaf.op.attributes[VARS_KEY]
    ) {
      const leafNode = this.editor.model.getLeafNode(nextLeaf);
      const node = leafNode && leafNode.querySelector(`[${DATA_EDITABLE_KEY}]`);
      if (!node) return void 0;
      const targetNode = isDOMText(node.firstChild) ? node.firstChild : node;
      selection.setBaseAndExtent(targetNode, 0, targetNode, 0);
      context.stop();
      event.preventDefault();
    }
    if (
      isArrowLeft(event) &&
      leaf &&
      leaf.embed &&
      leaf &&
      sel.start.offset === leaf.offset + leaf.length &&
      leaf.op.attributes &&
      leaf.op.attributes[VARS_KEY]
    ) {
      const leafNode = this.editor.model.getLeafNode(leaf);
      const node = leafNode && leafNode.querySelector(`[${DATA_EDITABLE_KEY}]`);
      if (!node) return void 0;
      const targetNode = isDOMText(node.firstChild) ? node.firstChild : node;
      const offset = isDOMText(node.firstChild) ? node.firstChild.length : 0;
      selection.setBaseAndExtent(targetNode, offset, targetNode, offset);
      context.stop();
      event.preventDefault();
    }
  }

  @Bind
  public onEditableKeydown(e: KeyboardEvent, value: string) {
    this.options.onKeydown && this.options.onKeydown(e);
    const editor = this.editor;
    const readonly = this.editor.state.isReadonly();
    const sel = window.getSelection();
    if (sel && sel.isCollapsed) {
      isKeyCode(e, KEY_CODE.TAB) && onTabKey(editor, sel, e);
      !readonly && isKeyCode(e, KEY_CODE.LEFT) && onLeftArrowKey(sel, e);
      !readonly && isKeyCode(e, KEY_CODE.RIGHT) && onRightArrowKey(value, sel, e);
    }
  }

  public onTextChange(leaf: LeafState, value: string, event: InputEvent) {
    const rawRange = leaf.toRawRange();
    if (!rawRange) return void 0;
    const delta = new Delta().retain(rawRange.start).retain(rawRange.len, {
      [VARS_VALUE_KEY]: value,
    });
    this.editor.state.apply(delta, {
      autoCaret: false,
      // 即使不记录到 History 模块, 仍然存在部分问题
      // 但若是受控处理, 则又存在焦点问题, 因为此时焦点并不在编辑器
      undoable: event.inputType !== "historyUndo" && event.inputType !== "historyRedo",
    });
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const { attributes: attrs = {} } = context;
    const varKey = attrs[VARS_KEY];
    const value = attrs[VARS_VALUE_KEY] || "";
    const placeholders = this.options.placeholders || {};
    return (
      <Embed context={context}>
        <EditableTextInput
          value={value}
          placeholder={placeholders[varKey]}
          onKeydown={e => this.onEditableKeydown(e, value)}
          onChange={(v, e) => this.onTextChange(context.leafState, v, e)}
          className={cs(VARS_CLS_PREFIX, `${VARS_CLS_PREFIX}-${varKey}`)}
        ></EditableTextInput>
      </Embed>
    );
  }
}
