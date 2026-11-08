import { CorePlugin, Editor, EDITOR_EVENT, Point, Range } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { KEY_CODE } from "@block-kit/utils";

import { BulletListPlugin } from "../../src/bullet-list";
import { BULLET_LIST_TYPE, LIST_TYPE_KEY } from "../../src/bullet-list/types";

/**
 * 构造无序列表编辑器, 首行为 `一级无序列表`
 */
const createListEditor = () => {
  const delta = new Delta()
    .insert("一级无序列表")
    .insertEOL({ [LIST_TYPE_KEY]: BULLET_LIST_TYPE });
  const editor = new Editor({ delta });
  // 插件构造时从静态属性注入编辑器实例
  CorePlugin.editor = editor;
  new BulletListPlugin(editor);
  return editor;
};

/**
 * 模拟真实输入法的按键序列
 * 组合输入中按 Enter 只应上屏选词, 不应触发编辑器的回车逻辑
 * @param editor 编辑器实例
 * @param data 上屏文本
 */
const simulateIME = (editor: Editor, data: string) => {
  // 开始拼写
  const start = new CompositionEvent("compositionstart", { bubbles: true, data: "" });
  // 拼写过程中的 Enter, 真实输入法中此时 isComposing 为 true
  const keyDown = new KeyboardEvent("keydown", {
    bubbles: true,
    keyCode: KEY_CODE.ENTER,
    isComposing: true,
  } as KeyboardEventInit);
  const keyUp = new KeyboardEvent("keyup", { bubbles: true, keyCode: KEY_CODE.ENTER });
  // 上屏完成
  const end = new CompositionEvent("compositionend", { bubbles: true, data });
  // 依次派发到编辑器事件总线
  editor.event.trigger(EDITOR_EVENT.COMPOSITION_START, start);
  const preventDefault = jest.spyOn(keyDown, "preventDefault");
  editor.event.trigger(EDITOR_EVENT.KEY_DOWN, keyDown);
  editor.event.trigger(EDITOR_EVENT.KEY_UP, keyUp);
  editor.event.trigger(EDITOR_EVENT.COMPOSITION_END, end);
  return { keyDown, keyUp, preventDefault };
};

describe("bullet list ime keydown", () => {
  it("ignore enter while composing", () => {
    const editor = createListEditor();
    // 光标定位于行末
    const text = "一级无序列表";
    editor.selection.set(new Range(new Point(0, text.length), new Point(0, text.length)));
    const { preventDefault } = simulateIME(editor, "你");
    // 组合输入中按 Enter 不应触发回车逻辑, 也不应阻止默认行为
    expect(preventDefault).not.toHaveBeenCalled();
    // 上屏文本由 compositionend 写入, 但仍保持单行且保留列表属性
    const lines = editor.state.block.getLines();
    expect(lines.length).toBe(1);
    expect(lines[0].attributes[LIST_TYPE_KEY]).toBe(BULLET_LIST_TYPE);
    expect(lines[0].getLeaves().filter(leaf => !leaf.eol)[0].getText()).toBe(text + "你");
  });

  it("handle enter after composing end", () => {
    const editor = createListEditor();
    const text = "一级无序列表";
    editor.selection.set(new Range(new Point(0, text.length), new Point(0, text.length)));
    // 上屏完成后再次回车, 才应插入携带列表属性的新行
    const after = new KeyboardEvent("keydown", {
      bubbles: true,
      keyCode: KEY_CODE.ENTER,
      isComposing: false,
    } as KeyboardEventInit);
    editor.event.trigger(EDITOR_EVENT.KEY_DOWN, after);
    const lines = editor.state.block.getLines();
    expect(lines.length).toBe(2);
    expect(lines[1].attributes[LIST_TYPE_KEY]).toBe(BULLET_LIST_TYPE);
  });
});
