import { Delta } from "@block-kit/delta";
import { KEY_CODE } from "@block-kit/utils";

import { Editor, LOG_LEVEL, Range } from "../../src";
import { mountEditorViewModel } from "../config/view";

describe("selection embed", () => {
  const delta = new Delta({
    ops: [
      { insert: "text" },
      { insert: " ", attributes: { mention: " ", text: "123456" } },
      { insert: " ", attributes: { mention: " ", text: "789" } },
      { insert: "\n" },
    ],
  });
  const editor = new Editor({
    delta,
    logLevel: LOG_LEVEL.INFO,
    schema: {
      mention: { inline: true, void: true },
    },
  });
  editor.state.set("FOCUS", true);
  const { leafDOMs } = mountEditorViewModel(editor);

  it("normal zero node", () => {
    const sel = document.getSelection();
    sel?.setBaseAndExtent(
      leafDOMs[0][0].querySelector("[data-string]")!.firstChild!,
      0,
      leafDOMs[0][1].querySelector("[data-zero-embed]")!.firstChild!,
      1
    );
    document.dispatchEvent(new Event("selectionchange"));
    // 在零宽字符的节点光标放置在左侧
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 0], [0, 4]));
  });

  it("forward content-editable embed", () => {
    const sel = document.getSelection();
    sel?.setBaseAndExtent(
      leafDOMs[0][0].querySelector("[data-string]")!.firstChild!,
      0,
      leafDOMs[0][1].querySelector("[contenteditable=false]")!,
      0
    );
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 0], [0, 5]));
  });

  it("backward content-editable embed", () => {
    const sel = document.getSelection();
    sel?.setBaseAndExtent(
      leafDOMs[0][1].querySelector("[contenteditable=false]")!,
      1,
      leafDOMs[0][2].querySelector("[contenteditable=false]")!,
      0
    );
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 4], [0, 6]));
  });

  it("forward data-leaf embed", () => {
    const sel = document.getSelection();
    sel?.setBaseAndExtent(leafDOMs[0][0], 0, leafDOMs[0][1], 2);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 0], [0, 5]));
  });

  it("backward content-editable embed", () => {
    const sel = document.getSelection();
    // leafDOMs[0][1], 2 => span contenteditable="false" data-void="true"
    sel?.setBaseAndExtent(leafDOMs[0][1], 2, leafDOMs[0][2], 2);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 5], [0, 6]));
  });

  it("text content selection embed", () => {
    const sel = document.getSelection();
    const node = leafDOMs[0][1].querySelector("[data-embed-text]")!;
    const text = node.firstChild!;
    sel?.setBaseAndExtent(text, 2, text, 2);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 5], [0, 5]));
  });

  it("embed selection right arrow", () => {
    editor.selection.set(Range.fromTuple([0, 4], [0, 4]), true);
    const container = editor.getContainer();
    const event = new KeyboardEvent("keydown", { keyCode: KEY_CODE.RIGHT });
    container.dispatchEvent(event);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 5], [0, 5]));
  });

  it("lead embed selection right arrow", () => {
    const delta1 = new Delta({
      ops: [{ insert: " ", attributes: { mention: " ", text: "123456" } }, { insert: "\n" }],
    });
    const editor1 = new Editor({
      delta: delta1,
      schema: { mention: { inline: true, void: true } },
    });
    editor1.state.set("FOCUS", true);
    mountEditorViewModel(editor1);
    editor1.selection.set(Range.fromTuple([0, 0], [0, 0]), true);
    const container = editor1.getContainer();
    const event = new KeyboardEvent("keydown", { keyCode: KEY_CODE.RIGHT });
    container.dispatchEvent(event);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor1.selection.get()).toEqual(Range.fromTuple([0, 1], [0, 1]));
  });

  it("embed selection end right arrow", () => {
    const delta1 = new Delta({
      ops: [
        { insert: "text" },
        { insert: " ", attributes: { mention: " ", text: "789" } },
        { insert: "\n" },
        { insert: "text" },
        { insert: "\n" },
      ],
    });
    const editor1 = new Editor({
      delta: delta1,
      schema: { mention: { inline: true, void: true } },
    });
    editor1.state.set("FOCUS", true);
    mountEditorViewModel(editor1);
    editor1.selection.set(Range.fromTuple([0, 5], [0, 5]), true);
    const container = editor1.getContainer();
    const event = new KeyboardEvent("keydown", { keyCode: KEY_CODE.RIGHT });
    container.dispatchEvent(event);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor1.selection.get()).toEqual(Range.fromTuple([1, 0], [1, 0]));
  });
});
