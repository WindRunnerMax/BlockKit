import {
  getRootSelection,
  getStaticSelection,
  isBackwardDOMRange,
  isEqualDOMRange,
  isNeedIgnoreRangeDOM,
} from "@block-kit/core";
import { Bind } from "@block-kit/utils";

import type { BlockEditor } from "../editor";
import { EDITOR_EVENT } from "../event/bus";
import { EDITOR_STATE } from "../state/types";
import { Range } from "./modules/range";
import { toModelRange } from "./utils/model";
import { isSelectionElement, toDOMRange } from "./utils/native";

export class Selection {
  /** 上次时间片快照 */
  protected lastRecord: number;
  /** 时间片内执行次数 */
  protected execution: number;
  /** 先前选区 */
  protected previous: Range | null;
  /** 当前选区 */
  protected current: Range | null;
  /** 块选区节点 */
  public element: HTMLElement | null;

  /**
   * 构造函数
   * @param editor
   */
  public constructor(protected editor: BlockEditor) {
    this.lastRecord = 0;
    this.execution = 0;
    this.previous = null;
    this.current = null;
    this.element = null;
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE_NATIVE, this.onNativeSelectionChange);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE_NATIVE, this.onNativeSelectionChange);
  }

  /**
   * 获取当前选区
   */
  public get(): Range | null {
    return this.current;
  }

  /**
   * 更新选区模型
   * @param range 选区
   * @param force [?=false] 强制更新浏览器选区
   */
  public set(range: Range | null, force = false): void {
    if (Range.equals(this.current, range)) {
      this.current = range;
      // FIX: [cursor]\n 状态按右箭头 Model 校准, 但是 DOM 没有校准
      // 因此即使选区没有变化, 在 force 模式下也需要更新 DOM 选区
      force && this.updateDOMSelection();
      return void 0;
    }
    this.previous = this.current;
    this.current = range;
    this.editor.logger.debug("Selection Change", range);
    this.editor.event.trigger(EDITOR_EVENT.SELECTION_CHANGE, {
      previous: this.previous,
      current: this.current,
    });
    if (force) {
      this.updateDOMSelection();
    }
  }

  /**
   * 获取 Entry 选区表达
   */
  public toEntries() {
    return this.current ? this.current.nodes : null;
  }

  /**
   * 更新浏览器选区
   * @param force [?=false] 忽略 MouseDown 状态检查
   */
  public updateDOMSelection(force = false) {
    // 在跨节点选中文本, 且唤醒 IME 输入后, 需要删除内容否则会导致 Crash
    // 这里有个奇怪表现, 若是不更新浏览器选区, 会导致原选区后的节点都无法渲染
    if (!force && this.editor.state.get(EDITOR_STATE.COMPOSING)) {
      return false;
    }
    // 按下鼠标的情况下不更新选区, 而 force 的情况则例外
    // 若总是更新选区, 则会导致独行的 Embed 节点无法选中, 需要非受控
    // 若是没有 force 的调度控制, 则在按下鼠标且输入时会导致选区 DOM 滞留
    if (!force && this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) {
      return false;
    }
    const range = this.current;
    const root = this.editor.getContainer();
    const selection = range && getRootSelection(root);
    if (!selection || !range) {
      return false;
    }
    const sel = toDOMRange(this.editor, range);
    if (!sel || !sel.startContainer || !sel.endContainer) {
      this.editor.logger.warning("Invalid DOM Range", sel, range);
      selection.removeAllRanges();
      return false;
    }
    const currentStaticSel = getStaticSelection(selection);
    if (isEqualDOMRange(sel, currentStaticSel)) {
      return true;
    }
    const { startContainer, startOffset, endContainer, endOffset } = sel;
    // 这里的 Backward 以 Range 状态为准
    if (range.isBackward) {
      selection.setBaseAndExtent(endContainer, endOffset, startContainer, startOffset);
    } else {
      selection.setBaseAndExtent(startContainer, startOffset, endContainer, endOffset);
    }
    return true;
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
    if (isSelectionElement(startContainer) || isSelectionElement(endContainer)) {
      return void 0;
    }
    if (isNeedIgnoreRangeDOM(startContainer, root)) {
      return void 0;
    }
    if (!collapsed && isNeedIgnoreRangeDOM(endContainer, root)) {
      return void 0;
    }
    const backward = isBackwardDOMRange(sel, staticSel);
    const range = toModelRange(this.editor, staticSel, backward);
    this.set(range, true);
  }
}
