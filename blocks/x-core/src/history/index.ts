import { isRedo, isUndo } from "@block-kit/core";
import { isRetainOp } from "@block-kit/delta";
import { Bind } from "@block-kit/utils";
import type { BlocksChange } from "@block-kit/x-json";
import { isEmptyChanges, isTextDeltaOp } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import type { ContentChangeEvent } from "../event/bus/";
import { EDITOR_EVENT } from "../event/bus/";
import { Entry } from "../selection/modules/entry";
import { Range } from "../selection/modules/range";
import { POINT_TYPE } from "../selection/utils/constant";
import { APPLY_SOURCE } from "../state/types";
import { restoreApplyChange } from "../state/utils/normalize";
import { Transform } from "../state/utils/transform";
import type { StackItem } from "./types";

export class History {
  /** 延时 */
  protected readonly DELAY = 1000;
  /** 堆栈最大值 */
  protected readonly STACK_SIZE = 100;
  /** 前次执行记录时间 */
  protected lastRecord: number;
  /** UNDO 栈 */
  protected undoStack: StackItem[];
  /** REDO 栈 */
  protected redoStack: StackItem[];
  /** 内容变化前的选区 */
  protected currentRange: Range | null;
  /** 批量执行 */
  protected batching: number[];

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: BlockEditor) {
    this.batching = [];
    this.redoStack = [];
    this.undoStack = [];
    this.lastRecord = 0;
    this.currentRange = null;
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
    this.editor.event.on(EDITOR_EVENT.CONTENT_WILL_CHANGE, this.onContentWillChange);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.undoStack = [];
    this.redoStack = [];
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
    this.editor.event.off(EDITOR_EVENT.CONTENT_WILL_CHANGE, this.onContentWillChange);
  }

  /**
   * undo
   */
  public undo() {
    if (!this.undoStack.length) return void 0;
    const item = this.undoStack.pop();
    if (!item) return void 0;
    const snapshot = this.editor.state.toBlockSet();
    const inverted = Transform.invert(item.changes, snapshot);
    this.redoStack.push({
      id: item.id,
      changes: inverted,
      range: item.latestRange,
      latestRange: item.range,
    });
    this.lastRecord = 0;
    const { HISTORY } = APPLY_SOURCE;
    this.editor.state.apply(restoreApplyChange(item.changes), {
      source: HISTORY,
      autoCaret: false,
      preventNormalize: true,
    });
    this.restoreSelection(item);
  }

  /**
   * redo
   */
  public redo() {
    if (!this.redoStack.length) return void 0;
    const item = this.redoStack.pop();
    if (!item) return void 0;
    const snapshot = this.editor.state.toBlockSet();
    const inverted = Transform.invert(item.changes, snapshot);
    this.undoStack.push({
      id: item.id,
      changes: inverted,
      range: item.latestRange,
      latestRange: item.range,
    });
    this.lastRecord = 0;
    const { HISTORY } = APPLY_SOURCE;
    this.editor.state.apply(restoreApplyChange(item.changes), {
      source: HISTORY,
      autoCaret: false,
      preventNormalize: true,
    });
    this.restoreSelection(item);
  }

  /**
   * 开始批量操作
   * - 以堆栈的形式记录状态
   * ```
   * begin
   *  apply
   *    begin
   *      apply
   *    close
   * close
   * ```
   */
  public beginBatch() {
    this.batching.push(1);
  }

  /**
   * 结束批量操作
   * - 务必保证 begin 和 close 成对出现
   */
  public closeBatch() {
    this.batching.pop();
  }

  /**
   * 批量执行回调
   * - 合并执行的历史记录
   * @param callback
   */
  public batch(callback: () => void) {
    this.beginBatch();
    callback();
    this.closeBatch();
  }

  /**
   * 正在执行批量操作
   */
  public isBatching() {
    return this.batching.length > 0;
  }

  /**
   * 将 mergeId 记录合并到 baseId 记录
   * - 暂时仅支持合并 retain 操作, 需保证 baseId < mergeId
   * - 其他操作暂时没有场景, 可查阅 NOTE 的 History Merge 一节
   * @param baseId
   * @param mergeId
   */
  public mergeRecord(baseId: string, mergeId: string): boolean {
    const baseIndex = this.undoStack.findIndex(item => item.id.has(baseId));
    const mergeIndex = this.undoStack.findIndex(item => item.id.has(mergeId));
    if (baseIndex === -1 || mergeIndex === -1 || baseIndex >= mergeIndex) {
      return false;
    }
    const baseItem = this.undoStack[baseIndex];
    const mergeItem = this.undoStack[mergeIndex];
    let mergeDelta = mergeItem.changes;
    for (let i = mergeIndex - 1; i > baseIndex; i--) {
      const item = this.undoStack[i];
      mergeDelta = Transform.transform(item.changes, mergeDelta);
    }
    this.undoStack[baseIndex] = {
      id: new Set([...baseItem.id, ...mergeItem.id]),
      // 这里是 merge.compose(base) 而不是 base.compose(merge)
      // 因为 undo 后的执行顺序是 merge -> base
      changes: Transform.compose(mergeDelta, baseItem.changes),
      range: baseItem.range,
      latestRange: mergeItem.range,
    };
    this.undoStack.splice(mergeIndex, 1);
    return true;
  }

  /**
   * undoable
   */
  public isUndoAble() {
    return this.undoStack.length > 0;
  }

  /**
   * redoable
   */
  public isRedoAble() {
    return this.redoStack.length > 0;
  }

  /**
   * 清空历史记录
   */
  public clear() {
    this.batching = [];
    this.redoStack = [];
    this.undoStack = [];
    this.lastRecord = 0;
    this.currentRange = null;
  }

  /**
   * 获取最新选区
   */
  @Bind
  protected onContentWillChange() {
    const range = this.editor.selection.get();
    this.currentRange = range;
  }

  /**
   * 键盘事件
   * @param event
   */
  @Bind
  protected onKeyDown(event: KeyboardEvent) {
    // 事件由容器 DOM 分发, 无需处理焦点
    if (isUndo(event)) {
      this.undo();
      event.preventDefault();
    }
    if (isRedo(event)) {
      this.redo();
      event.preventDefault();
    }
  }

  /**
   * 处理内容变更事件
   * @param event
   */
  @Bind
  protected onContentChange(event: ContentChangeEvent) {
    const { changes, previous, source, id } = event;
    if (isEmptyChanges(changes) || source === APPLY_SOURCE.HISTORY) {
      return void 0;
    }
    if (event.source === APPLY_SOURCE.REMOTE || event.options.undoable === false) {
      this.transformStack(this.undoStack, changes);
      this.transformStack(this.redoStack, changes);
      return void 0;
    }
    this.redoStack = [];
    let inverted = Transform.invert(changes, previous);
    let undoRange = this.currentRange;
    let idSet = new Set<string>([id]);
    const timestamp = Date.now();
    if (
      // 如果触发时间在 delay 时间片内或者批量执行时, 需要合并上一个记录
      (this.lastRecord + this.DELAY > timestamp || this.isBatching()) &&
      this.undoStack.length > 0
    ) {
      const item = this.undoStack.pop();
      if (item) {
        inverted = Transform.compose(inverted, item.changes);
        undoRange = item.range;
        idSet = item.id.add(id);
      }
    } else {
      this.lastRecord = timestamp;
    }
    if (isEmptyChanges(inverted)) {
      return void 0;
    }
    const latestRange = this.editor.selection.get();
    const item: StackItem = { changes: inverted, range: undoRange, id: idSet, latestRange };
    this.undoStack.push(item);
    if (this.undoStack.length > this.STACK_SIZE) {
      this.undoStack.shift();
    }
  }

  /**
   * 变换远程堆栈
   * @param stack
   * @param delta
   */
  protected transformStack(stack: StackItem[], changes: BlocksChange) {
    let remoteChanges = changes;
    for (let i = stack.length - 1; i >= 0; i--) {
      const prevItem = stack[i];
      const range = prevItem.range;
      const latestRange = prevItem.latestRange;
      stack[i] = {
        id: prevItem.id,
        changes: Transform.transform(remoteChanges, prevItem.changes, true),
        range: range && this.transformRange(range, remoteChanges),
        latestRange: latestRange && this.transformRange(latestRange, remoteChanges),
      };
      remoteChanges = Transform.transform(prevItem.changes, remoteChanges);
      if (!stack[i].changes.ops.length) {
        stack.splice(i, 1);
      }
    }
  }

  /**
   * 变换选区
   * - 假设此时 undo delta 为 insert "xxx", range 索引为 3
   * - 那么 invert 之后为 delete 3, range 需要变换到 0 的位置
   * @param range
   * @param delta
   */
  protected transformRange(range: Range | null, changes: BlocksChange) {
    if (!range) return range;
    return Transform.position(changes, range);
  }

  /**
   * 恢复选区位置
   * @param stackItem
   */
  protected restoreSelection(stackItem: StackItem) {
    if (stackItem.range) {
      this.editor.selection.set(stackItem.range);
    } else {
      // 尝试找到首个文本的选区位置
      const changes = stackItem.changes;
      for (const [id, ops] of Object.entries(changes)) {
        for (const op of ops) {
          if (!isTextDeltaOp(op)) continue;
          let index = 0;
          if (isRetainOp(op.o[0])) index = op.o[0].retain;
          const entry = Entry.create(id, POINT_TYPE.TEXT, index, 0);
          const range = new Range(entry);
          return this.editor.selection.set(range);
        }
      }
    }
    return void 0;
  }
}
