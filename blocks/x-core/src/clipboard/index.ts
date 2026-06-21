import { Bind, TEXT_PLAIN } from "@block-kit/utils";

import type { BlockEditor } from "../editor";
import { EDITOR_EVENT } from "../event/bus";

export class Clipboard {
  /**
   * 构造函数
   * @param editor
   */
  public constructor(protected editor: BlockEditor) {
    this.editor.event.on(EDITOR_EVENT.PASTE, this.onPaste);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.PASTE, this.onPaste);
  }

  /**
   * OnPaste 事件
   * @param event
   */
  @Bind
  protected onPaste(event: ClipboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    const transfer = event.clipboardData;
    if (!transfer || this.editor.state.isReadonly()) {
      return void 0;
    }
    const files = Array.from(transfer.files);
    const transferPlainText = transfer.getData(TEXT_PLAIN);
    this.editor.logger.info("Paste Clipboard Data:", {
      files: files,
      [TEXT_PLAIN]: transferPlainText,
    });
    const sel = this.editor.selection.get();
    if (transferPlainText && sel) {
      this.editor.perform.insertText(sel, transferPlainText);
    }
  }
}
