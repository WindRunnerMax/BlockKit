import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, normalizeModelRange, Point, Range } from "../../src";

describe("perform apply marks", () => {
  it("apply inline marks", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123456" }], parent: "root" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 1),
      Point.create("child1", "T", 3)
    );
    editor.selection.set(new Range(range));
    editor.perform.applyMarks(editor.selection.get()!, { bold: "true" });
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.delta).toEqual([
      { insert: "1" },
      { insert: "23", attributes: { bold: "true" } },
      { insert: "456" },
    ]);
  });

  it("apply block marks", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["quote_block"], parent: "" },
      },
      quote_block: {
        id: "quote_block",
        version: 1,
        data: {
          // @ts-expect-error quote block type
          type: "quote",
          parent: "root",
          children: ["quote_text"],
        },
      },
      quote_text: {
        id: "quote_text",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "456" }], parent: "quote_block" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("quote_block", "B"),
      Point.create("quote_block", "B")
    );
    editor.selection.set(new Range(range));
    editor.perform.applyMarks(editor.selection.get()!, { bold: "true" });
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.quote_text.data.delta).toEqual([
      { insert: "456", attributes: { bold: "true" } },
    ]);
  });
});
