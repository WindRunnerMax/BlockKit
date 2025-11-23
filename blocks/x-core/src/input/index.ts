import { ALERT, DIRECTION, GRANULARITY } from "@block-kit/core";
import { Bind } from "@block-kit/utils";

import type { BlockEditor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/";
import { EDITOR_STATE } from "../state/types";

export class Input {
  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: BlockEditor) {
    this.editor.event.on(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
    this.editor.event.on(EDITOR_EVENT.COMPOSITION_START, this.onCompositionStart);
    this.editor.event.on(EDITOR_EVENT.COMPOSITION_END, this.onCompositionEnd);
  }

  /**
   * 销毁组件
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
    this.editor.event.off(EDITOR_EVENT.COMPOSITION_START, this.onCompositionStart);
    this.editor.event.off(EDITOR_EVENT.COMPOSITION_END, this.onCompositionEnd);
  }

  /**
   * BeforeInput
   * @param event
   */
  @Bind
  protected onBeforeInput(event: InputEvent) {
    if (this.editor.state.get(EDITOR_STATE.COMPOSING)) {
      return void 0;
    }
    event.preventDefault();
    const { inputType, data = "" } = event;
    const sel = this.editor.selection.get();
    if (!sel || sel.isEmpty()) return void 0;
    const { WORD } = GRANULARITY;
    const { BACKWARD, FORWARD } = DIRECTION;
    const { EXTEND } = ALERT;
    switch (inputType) {
      // case "deleteByDrag":
      case "deleteByComposition":
      case "deleteByCut": {
        const res = this.editor.perform.deleteFragment(sel);
        this.editor.perform.applyChanges(res);
        break;
      }
      case "deleteWordBackward": {
        const newRange = this.editor.selection.move(WORD, BACKWARD, EXTEND);
        const res = this.editor.perform.deleteBackward(newRange || sel);
        this.editor.perform.applyChanges(res);
        break;
      }
      case "deleteContent":
      case "deleteContentBackward": {
        // this.editor.perform.deleteBackward(sel);
        break;
      }
      case "deleteWordForward": {
        const newRange = this.editor.selection.move(WORD, FORWARD, EXTEND);
        const res = this.editor.perform.deleteBackward(newRange || sel);
        this.editor.perform.applyChanges(res);
        break;
      }
      case "deleteContentForward": {
        // this.editor.perform.deleteForward(sel);
        break;
      }
      case "insertLineBreak":
      case "insertParagraph": {
        // this.editor.perform.insertBreak(sel);
        break;
      }
      // case "insertFromDrop":
      case "insertFromPaste":
      case "insertFromYank":
      case "insertReplacementText":
      case "insertText": {
        const res = this.editor.perform.insertText(sel, data || "");
        this.editor.perform.applyChanges(res);
        break;
      }
      default:
        break;
    }
  }

  /**
   * 组合输入开始
   * @param event
   */
  @Bind
  protected onCompositionStart() {
    // 避免 IME 破坏跨节点渲染造成问题
    const sel = this.editor.selection.get();
    if (!sel || sel.isCollapsed) return void 0;
    const res = this.editor.perform.deleteFragment(sel);
    this.editor.perform.applyChanges(res);
  }

  /**
   * 组合输入结束
   * @param event
   */
  @Bind
  protected onCompositionEnd(event: CompositionEvent) {
    event.preventDefault();
    const data = event.data;
    const sel = this.editor.selection.get();
    const res = sel && this.editor.perform.insertText(sel, data || "");
    res && this.editor.perform.applyChanges(res);
  }
}
