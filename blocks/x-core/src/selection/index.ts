import {
  getRootSelection,
  getStaticSelection,
  isBackwardDOMRange,
  isNeedIgnoreRangeDOM,
} from "@block-kit/core";
import { Bind } from "@block-kit/utils";

import type { BlockEditor } from "../editor";
import type { Range } from "./modules/range";
import { toModelRange } from "./utils/model";

export class Selection {
  /** 上次时间片快照 */
  protected lastRecord: number;
  /** 时间片内执行次数 */
  protected execution: number;
  /** 先前选区 */
  protected previous: Range | null;
  /** 当前选区 */
  protected current: Range | null;

  /**
   * 构造函数
   * @param editor
   */
  public constructor(protected editor: BlockEditor) {
    this.lastRecord = 0;
    this.execution = 0;
    this.previous = null;
    this.current = null;
  }

  /**
   * 检查时间片执行次数限制
   */
  protected limit() {
    const now = Date.now();
    // 如果距离上次记录时间超过 500ms, 重置执行次数
    if (now - this.lastRecord >= 500) {
      this.execution = 0;
      this.lastRecord = now;
    }
    // 如果执行次数超过 100 次的限制, 需要打断执行
    if (this.execution++ >= 100) {
      this.editor.logger.error("Selection Exec Limit", this.execution);
      return true;
    }
    return false;
  }

  /**
   * 处理选区变换事件
   */
  @Bind
  protected onNativeSelectionChange() {
    if (this.editor.state.isComposing()) {
      return void 0;
    }
    const root = this.editor.getContainer();
    const sel = getRootSelection(root);
    const staticSel = getStaticSelection(sel);
    if (!sel || !staticSel || this.limit()) {
      return void 0;
    }
    // 选区必然是从 startContainer 到 endContainer
    const { startContainer, endContainer, collapsed } = staticSel;
    if (isNeedIgnoreRangeDOM(startContainer, root)) {
      return void 0;
    }
    if (!collapsed && isNeedIgnoreRangeDOM(endContainer, root)) {
      return void 0;
    }
    const backward = isBackwardDOMRange(sel, staticSel);
    const range = toModelRange(this.editor, staticSel, backward);
    console.log("range :>> ", range);
  }
}
