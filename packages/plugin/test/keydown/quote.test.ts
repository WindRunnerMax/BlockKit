import { CorePlugin, Editor, EDITOR_EVENT, Point, Range } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { KEY_CODE } from "@block-kit/utils";

import { QuotePlugin } from "../../src/quote";
import { QUOTE_KEY } from "../../src/quote/types";

/**
 * 构造编辑器实例
 * @param delta 初始内容
 */
const createEditor = (delta: Delta) => {
  const editor = new Editor({ delta });
  // 插件构造时从静态属性注入编辑器实例
  CorePlugin.editor = editor;
  new QuotePlugin(editor);
  return editor;
};

/**
 * 派发按键事件
 * @param editor 编辑器实例
 * @param keyCode 键码
 */
const triggerKeyDown = (editor: Editor, keyCode: number) => {
  const event = {
    keyCode,
    isComposing: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  } as unknown as KeyboardEvent;
  const context = editor.event.trigger(EDITOR_EVENT.KEY_DOWN, event);
  return { event, context };
};

describe("quote plugin keydown", () => {
  it("keep quote when press enter at empty line end", () => {
    const editor = createEditor(new Delta().insert("引用").insertEOL({ [QUOTE_KEY]: "true" }));
    editor.selection.set(new Range(new Point(0, 2), new Point(0, 2)));
    const { event } = triggerKeyDown(editor, KEY_CODE.ENTER);
    // 行内有内容时, 回车应插入携带引用属性的新行, 而不是移除引用
    expect(event.preventDefault).toHaveBeenCalled();
    const lines = editor.state.block.getLines();
    expect(lines.length).toBe(2);
    expect(lines[0].attributes[QUOTE_KEY]).toBe("true");
    expect(lines[1].attributes[QUOTE_KEY]).toBe("true");
  });

  it("remove quote when press enter at empty line", () => {
    const editor = createEditor(new Delta().insertEOL({ [QUOTE_KEY]: "true" }));
    editor.selection.set(new Range(new Point(0, 0), new Point(0, 0)));
    const { event, context } = triggerKeyDown(editor, KEY_CODE.ENTER);
    // 空引用行回车应取消引用属性, 并阻止后续插件处理
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(context && "key" in context).toBeTruthy();
    const line = editor.state.block.getLine(0)!;
    expect(line.attributes[QUOTE_KEY]).toBeUndefined();
  });

  it("remove quote when press backspace at line head", () => {
    const editor = createEditor(new Delta().insert("引用").insertEOL({ [QUOTE_KEY]: "true" }));
    editor.selection.set(new Range(new Point(0, 0), new Point(0, 0)));
    const { event } = triggerKeyDown(editor, KEY_CODE.BACKSPACE);
    expect(event.preventDefault).toHaveBeenCalled();
    const line = editor.state.block.getLine(0)!;
    expect(line.attributes[QUOTE_KEY]).toBeUndefined();
    // 内容保持不变
    expect(line.getLeaves().filter(leaf => !leaf.eol)[0].getText()).toBe("引用");
  });

  it("ignore other keys", () => {
    const editor = createEditor(new Delta().insertEOL({ [QUOTE_KEY]: "true" }));
    editor.selection.set(new Range(new Point(0, 0), new Point(0, 0)));
    const { event } = triggerKeyDown(editor, KEY_CODE.SPACE);
    expect(event.preventDefault).not.toHaveBeenCalled();
    const line = editor.state.block.getLine(0)!;
    expect(line.attributes[QUOTE_KEY]).toBe("true");
  });
});
