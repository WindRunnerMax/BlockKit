import { Delta, MutateDelta } from "@block-kit/delta";

import { APPLY_SOURCE } from "../../src";
import { Editor } from "../../src/editor";
import type { ContentChangeEvent } from "../../src/event/bus";
import type { StackItem } from "../../src/history/types";
import { HISTORY_EFFECT } from "../../src/history/types";

describe("history effect", () => {
  /**
   * 构造测试用编辑器
   * - delay 为 0 时不会在时间片内自动合并
   * - stackSize 指定撤销栈最大值
   */
  const createEditor = (delay = 0, stackSize = 100) => {
    const editor = new Editor();
    // @ts-expect-error protected readonly property
    editor.history.DELAY = delay;
    // @ts-expect-error protected readonly property
    editor.history.STACK_SIZE = stackSize;
    // @ts-expect-error protected property
    return { editor, undoStack: editor.history.undoStack as StackItem[] };
  };

  /**
   * 构造内容变更事件
   */
  const createEvent = (
    editor: Editor,
    changes: Delta,
    options: Partial<ContentChangeEvent> = {}
  ) => {
    return {
      id: "MOCK_ID",
      previous: editor.state.toBlock(),
      current: editor.state.toBlock(),
      changes: changes,
      source: APPLY_SOURCE.USER,
      options: {},
      inserts: [],
      revises: [],
      deletes: [],
      ...options,
    } as ContentChangeEvent;
  };

  it("none for empty ops", () => {
    const { editor, undoStack } = createEditor();
    const event = createEvent(editor, new Delta());
    expect(editor.history["onContentChange"](event)).toBe(HISTORY_EFFECT.NONE);
    expect(undoStack.length).toBe(0);
  });

  it("none for history source", () => {
    const { editor, undoStack } = createEditor();
    editor.state.apply(new Delta().insert("1"));
    expect(undoStack.length).toBe(1);
    const event = createEvent(editor, new Delta().retain(1).insert("2"), {
      source: APPLY_SOURCE.HISTORY,
    });
    expect(editor.history["onContentChange"](event)).toBe(HISTORY_EFFECT.NONE);
    // 不改变已有的撤销栈
    expect(undoStack.length).toBe(1);
    expect(undoStack[0].delta.ops).toEqual([{ delete: 1 }]);
  });

  it("none for remote & undoable:false", () => {
    const { editor, undoStack } = createEditor();
    editor.state.apply(new Delta().insert("1"));
    expect(undoStack.length).toBe(1);
    // REMOTE 与 undoable:false 都不会记录新的一格, 但需要变换已有的栈
    editor.state.apply(new Delta().retain(1).insert("2"), { source: APPLY_SOURCE.REMOTE });
    editor.state.apply(new Delta().retain(2).insert("3"), { undoable: false });
    expect(undoStack.length).toBe(1);
    expect(undoStack[0].id).toEqual(new Set([expect.any(String)]));
    expect(undoStack[0].delta.ops).toEqual([{ delete: 1 }]);
    expect(editor.state.toBlock()).toEqual(new MutateDelta().insert("123").insertEOL());
  });

  it("append", () => {
    const { editor, undoStack } = createEditor();
    const { id } = editor.state.apply(new Delta().insert("1"));
    expect(undoStack.length).toBe(1);
    const event = createEvent(editor, new Delta().retain(1).insert("2"));
    expect(editor.history["onContentChange"](event)).toBe(HISTORY_EFFECT.APPEND);
    expect(undoStack.length).toBe(2);
    expect(undoStack[0].id).toEqual(new Set([id]));
    expect(undoStack[1].id).toEqual(new Set(["MOCK_ID"]));
  });

  it("append clears redo stack", () => {
    const { editor, undoStack } = createEditor();
    editor.state.apply(new Delta().insert("1"));
    editor.state.apply(new Delta().retain(1).insert("2"));
    editor.history.undo();
    expect(editor.history.isRedoAble()).toBe(true);
    editor.state.apply(new Delta().insert("3"));
    expect(editor.history.isRedoAble()).toBe(false);
    // @ts-expect-error protected property
    expect(editor.history.redoStack.length).toBe(0);
    expect(undoStack.length).toBe(2);
  });

  it("merge", () => {
    const { editor, undoStack } = createEditor(1000);
    editor.state.apply(new Delta().insert("1"));
    expect(undoStack.length).toBe(1);
    const event = createEvent(editor, new Delta().retain(1).insert("2"));
    expect(editor.history["onContentChange"](event)).toBe(HISTORY_EFFECT.MERGE);
    // 并入上一格, 栈长度不变
    expect(undoStack.length).toBe(1);
    expect(undoStack[0].id.size).toBe(2);
    expect(undoStack[0].delta.ops).toEqual([{ delete: 2 }]);
  });

  it("merge drop", () => {
    const { editor, undoStack } = createEditor(1000);
    editor.state.apply(new Delta().insert("x"));
    expect(undoStack.length).toBe(1);
    // 时间片内撤销, 走合并分支, 合并后与上一格完全抵消
    editor.history.undo();
    expect(undoStack.length).toBe(0);
    expect(editor.history.isUndoAble()).toBe(false);
    expect(editor.history.isRedoAble()).toBe(true);
    // @ts-expect-error protected property
    expect(editor.history.redoStack.length).toBe(1);
    expect(editor.state.toBlock()).toEqual(new MutateDelta().insertEOL());
  });

  it("none when a new record is right cancelled", () => {
    // 仅一个字符的文档没有行尾换行节点, 删除该字符逆向后为空
    const editor = new Editor({ delta: new Delta().insert("x") });
    // @ts-expect-error protected readonly property
    editor.history.DELAY = 0;
    // 未进入合并分支, 新记录逆向后为空, 不写入撤销栈
    const event = {
      id: "MOCK_ID",
      previous: new Delta().insert("x"),
      current: new Delta().insertEOL(),
      changes: new Delta().retain(1).delete(1),
      source: APPLY_SOURCE.USER,
      options: {},
      inserts: [],
      revises: [],
      deletes: [],
    } as ContentChangeEvent;
    expect(editor.history["onContentChange"](event)).toBe(HISTORY_EFFECT.NONE);
    // @ts-expect-error protected property
    expect(editor.history.undoStack.length).toBe(0);
    expect(editor.history.isUndoAble()).toBe(false);
  });

  it("append drop when stack is full", () => {
    const { editor, undoStack } = createEditor(0, 2);
    editor.state.apply(new Delta().insert("1"));
    editor.state.apply(new Delta().retain(1).insert("2"));
    expect(undoStack.length).toBe(2);
    const first = undoStack[0];
    editor.state.apply(new Delta().retain(2).insert("3"));
    // 栈满后丢弃最旧的一格
    expect(undoStack.length).toBe(2);
    expect(undoStack[0]).not.toBe(first);
    // 只能撤销两次, 回到 "1"
    editor.history.undo();
    editor.history.undo();
    expect(editor.history.isUndoAble()).toBe(false);
    expect(editor.state.toBlock()).toEqual(new MutateDelta().insert("1").insertEOL());
  });

  it("append drop effect", () => {
    const { editor, undoStack } = createEditor(0, 1);
    editor.state.apply(new Delta().insert("1"));
    expect(undoStack.length).toBe(1);
    const event = createEvent(editor, new Delta().retain(1).insert("2"));
    expect(editor.history["onContentChange"](event)).toBe(HISTORY_EFFECT.APPEND_DROP);
    expect(undoStack.length).toBe(1);
  });
});
