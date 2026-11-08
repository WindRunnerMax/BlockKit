import { Editor, Point, Range } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { KEY_CODE } from "@block-kit/utils";

import { LIST_TYPE_KEY } from "../../src/bullet-list/types";
import { HEADING_KEY } from "../../src/heading/types";
import { LIST_START_KEY, ORDER_LIST_KEY } from "../../src/order-list/types";
import { QUOTE_KEY } from "../../src/quote/types";
import { PRESET_SHORTCUT } from "../../src/shortcut/modules/preset";
import { matchLineMarker } from "../../src/shortcut/utils/marker";

/**
 * 构造编辑器实例
 * @param text 首行文本
 * @param offset 光标偏移
 */
const createEditor = (text: string, offset = text.length) => {
  const editor = new Editor({
    delta: new Delta().insert(text).insertEOL(),
    schema: {
      [LIST_TYPE_KEY]: { mark: true },
      [LIST_START_KEY]: { mark: true },
    },
  });
  editor.selection.set(new Range(new Point(0, offset), new Point(0, offset)));
  return editor;
};

/**
 * 调用预设快捷键
 * @param key 快捷键标识
 * @param editor 编辑器实例
 */
const execPreset = (key: string, editor: Editor) => {
  const func = PRESET_SHORTCUT[key];
  const event = { keyCode: KEY_CODE.SPACE, preventDefault: jest.fn() } as unknown as KeyboardEvent;
  const sel = editor.selection.get();
  const result = func(event, { editor, keys: {}, sel });
  return { result, event };
};

/** 获取首行的行级属性 */
const getLineAttributes = (editor: Editor) => {
  const line = editor.state.block.getLine(0)!;
  return line.attributes;
};

/** 获取首行的文本 */
const getLineText = (editor: Editor) => {
  const line = editor.state.block.getLine(0)!;
  return line
    .getLeaves()
    .filter(leaf => !leaf.eol)
    .map(leaf => leaf.getText())
    .join("");
};

describe("shortcut marker match", () => {
  it("match marker at caret with content after it", () => {
    const editor = createEditor("居左对齐", 0);
    editor.perform.insertText(editor.selection.get()!, "-");
    const sel = editor.selection.get()!;
    // 光标紧邻行首标记, 标记后的内容不影响匹配
    expect(matchLineMarker(editor, sel, ["-"])).toEqual({ marker: "-" });
  });

  it("match marker at line start", () => {
    const editor = createEditor("-");
    const sel = editor.selection.get()!;
    expect(matchLineMarker(editor, sel, ["-", "*"])).toEqual({ marker: "-" });
  });

  it("match marker with trailing spaces", () => {
    const editor = createEditor("-  ", 1);
    const sel = editor.selection.get()!;
    expect(matchLineMarker(editor, sel, ["-"])).toEqual({ marker: "-" });
  });

  it("require marker at line head", () => {
    const editor = createEditor("text -");
    const sel = editor.selection.get()!;
    expect(matchLineMarker(editor, sel, ["-"])).toBeNull();
  });

  it("reject marker not adjacent to caret", () => {
    const editor = createEditor("- item");
    const sel = editor.selection.get()!;
    // 光标位于行尾, 之前不是行首标记
    expect(matchLineMarker(editor, sel, ["-"])).toBeNull();
  });

  it("reject caret before marker", () => {
    const editor = createEditor("-", 0);
    const sel = editor.selection.get()!;
    expect(matchLineMarker(editor, sel, ["-"])).toBeNull();
  });

  it("reject caret after marker", () => {
    const editor = createEditor("--", 2);
    const sel = editor.selection.get()!;
    // 光标之前是 `--`, 不等于单个标记
    expect(matchLineMarker(editor, sel, ["-"])).toBeNull();
  });

  it("reject non-collapsed selection", () => {
    const editor = createEditor("--");
    editor.selection.set(new Range(new Point(0, 0), new Point(0, 2)));
    const sel = editor.selection.get()!;
    expect(matchLineMarker(editor, sel, ["-"])).toBeNull();
  });

  it("prefer longer marker", () => {
    const editor = createEditor("##");
    const sel = editor.selection.get()!;
    expect(matchLineMarker(editor, sel, ["#", "##", "###"])).toEqual({ marker: "##" });
  });
});

describe("shortcut preset list", () => {
  it("convert `-` to bullet list", () => {
    const editor = createEditor("-");
    const { result } = execPreset(LIST_TYPE_KEY, editor);
    expect(result).toBe(true);
    expect(getLineText(editor)).toBe("");
  });

  it("convert `1.` to order list", () => {
    const editor = createEditor("1.");
    const { result } = execPreset(LIST_TYPE_KEY, editor);
    expect(result).toBe(true);
    expect(getLineText(editor)).toBe("");
  });

  it("convert `-` when caret is before line content", () => {
    const editor = createEditor("居左对齐", 0);
    editor.perform.insertText(editor.selection.get()!, "-");
    const { result } = execPreset(LIST_TYPE_KEY, editor);
    expect(result).toBe(true);
    // 仅删除行首标记, 原有内容保留
    expect(getLineText(editor)).toBe("居左对齐");
  });

  it("ignore marker when caret moved away", () => {
    const editor = createEditor("-", 0);
    const { result, event } = execPreset(LIST_TYPE_KEY, editor);
    expect(result).toBeUndefined();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("ignore `-` when caret is at line end", () => {
    const editor = createEditor("- item");
    const { result } = execPreset(LIST_TYPE_KEY, editor);
    expect(result).toBeUndefined();
    expect(getLineText(editor)).toBe("- item");
  });
});

describe("shortcut preset quote", () => {
  it("convert `>` to quote", () => {
    const editor = createEditor(">");
    const { result } = execPreset(QUOTE_KEY, editor);
    expect(result).toBe(true);
    expect(getLineText(editor)).toBe("");
  });

  it("ignore `>` when caret is at line end", () => {
    const editor = createEditor("> text");
    const { result } = execPreset(QUOTE_KEY, editor);
    expect(result).toBeUndefined();
  });
});

describe("shortcut preset heading", () => {
  it("convert `##` to h2", () => {
    const editor = createEditor("##");
    const { result } = execPreset(HEADING_KEY, editor);
    expect(result).toBe(true);
    expect(getLineText(editor)).toBe("");
  });

  it("ignore `#` when caret is at line end", () => {
    const editor = createEditor("# text");
    const { result } = execPreset(HEADING_KEY, editor);
    expect(result).toBeUndefined();
  });
});
