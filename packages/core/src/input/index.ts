import { Bind } from "@block-kit/utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/";
import { Range } from "../selection/modules/range";
import { DIRECTION, GRANULARITY } from "../selection/types";
import { toModelRange } from "../selection/utils/model";
import { EDITOR_STATE } from "../state/types";

export class Input {
  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {
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
    if (!sel) {
      return void 0;
    }
    switch (inputType) {
      case "insertFromPaste":
      case "insertFromYank":
      case "insertReplacementText":
      case "insertText": {
        this.editor.perform.insertText(sel, data || "");
        break;
      }
      case "insertLineBreak":
      case "insertParagraph": {
        this.editor.perform.insertBreak(sel);
        break;
      }
      case "insertFromDrop": {
        if (!event.getTargetRanges) break;
        const domRange = event.getTargetRanges()[0];
        const range = domRange && toModelRange(this.editor, domRange, false);
        range && this.editor.perform.moveFragment(sel, range);
        break;
      }
      case "deleteContent":
      case "deleteContentBackward": {
        this.editor.perform.deleteBackward(sel);
        break;
      }
      case "deleteContentForward": {
        this.editor.perform.deleteForward(sel);
        break;
      }
      // case "deleteByDrag":
      case "deleteByComposition":
      case "deleteByCut": {
        this.editor.perform.deleteFragment(sel);
        break;
      }
      case "deleteWordBackward": {
        const newRange = this.editor.selection.move(GRANULARITY.WORD, DIRECTION.BACKWARD);
        this.editor.perform.deleteBackward(Range.aggregate(newRange, sel) || sel);
        break;
      }
      case "deleteWordForward": {
        const newRange = this.editor.selection.move(GRANULARITY.WORD);
        this.editor.perform.deleteBackward(Range.aggregate(newRange, sel) || sel);
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
    this.editor.perform.deleteFragment(sel);
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
    sel && this.editor.perform.insertText(sel, data || "");
  }
}
