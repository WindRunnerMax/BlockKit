import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, Entry, normalizeModelRange, Point, Range } from "../../src";

describe("perform delete character", () => {
  it("delete char backward", () => {
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
      Point.create("child1", "T", 2),
      Point.create("child1", "T", 2)
    );
    editor.selection.set(new Range(range));
    editor.perform.deleteBackward(editor.selection.get()!)!;
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.parent).toEqual("root");
    expect(blockSet.child1.data.delta).toEqual([{ insert: "13456" }]);
    expect(editor!.selection.get()!.at(0)).toEqual(Entry.create("child1", "T", 1, 0));
  });

  it("delete char forward", () => {
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
      Point.create("child1", "T", 4),
      Point.create("child1", "T", 4)
    );
    editor.selection.set(new Range(range));
    editor.perform.deleteForward(editor.selection.get()!)!;
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.parent).toEqual("root");
    expect(blockSet.child1.data.delta).toEqual([{ insert: "12346" }]);
    expect(editor!.selection.get()!.at(0)).toEqual(Entry.create("child1", "T", 4, 0));
  });

  it("delete emoji backward", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: {
          type: "text",
          children: [],
          // "🧑‍🎨".length = 5
          delta: [{ insert: "text🧑‍🎨🧑‍🎨123" }],
          parent: "root",
        },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 9),
      Point.create("child1", "T", 9)
    );
    editor.selection.set(new Range(range));
    editor.perform.deleteBackward(editor.selection.get()!)!;
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.parent).toEqual("root");
    expect(blockSet.child1.data.delta).toEqual([{ insert: "text🧑‍🎨123" }]);
    expect(editor!.selection.get()!.at(0)).toEqual(Entry.create("child1", "T", 4, 0));
  });

  it("delete emoji backward", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: {
          type: "text",
          children: [],
          delta: [{ insert: "text🧑‍🎨🧑‍🎨123" }],
          parent: "root",
        },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 9),
      Point.create("child1", "T", 9)
    );
    editor.selection.set(new Range(range));
    editor.perform.deleteForward(editor.selection.get()!)!;
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.parent).toEqual("root");
    expect(blockSet.child1.data.delta).toEqual([{ insert: "text🧑‍🎨123" }]);
    expect(editor!.selection.get()!.at(0)).toEqual(Entry.create("child1", "T", 9, 0));
  });
});
