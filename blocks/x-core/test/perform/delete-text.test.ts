import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, Entry, normalizeModelRange, Point, Range } from "../../src";

describe("perform delete-text fragment", () => {
  it("text common line", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123" }], parent: "root" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 1),
      Point.create("child1", "T", 2)
    );
    const { options } = editor.perform.deleteFragment(new Range(range))!;
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.parent).toEqual("root");
    expect(blockSet.child1.data.delta).toEqual([{ insert: "13" }]);
    expect(options!.selection!.at(0)).toEqual(Entry.create("child1", "T", 1, 0));
  });

  it("text cross line", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123" }], parent: "root" },
      },
      child2: {
        id: "child2",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "456" }], parent: "root" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 1),
      Point.create("child2", "T", 2)
    );
    const res = editor.perform.deleteFragment(new Range(range))!;
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.root.data.children).toEqual(["child1"]);
    expect(editor.state.blocks.root.data.children).toEqual(["child1"]);
    expect(editor.state.blocks.root.children.map(it => it.id)).toEqual(["child1"]);
    expect(Object.keys(blockSet)).toEqual(["root", "child1"]);
    expect(blockSet.child1.data.delta).toEqual([{ insert: "16" }]);
    expect(res.options!.selection!.at(0)).toEqual(Entry.create("child1", "T", 1, 0));
  });

  it("first block node", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        // @ts-expect-error ...
        data: { type: "quote", children: ["grandchild1"], parent: "root" },
      },
      grandchild1: {
        id: "grandchild1",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123" }], parent: "child1" },
      },
      child2: {
        id: "child2",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "456" }], parent: "root" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("grandchild1", "T", 1),
      Point.create("child2", "T", 2)
    );
    const { options } = editor.perform.deleteFragment(new Range(range))!;
    const blockSet = editor.state.toBlockSet();
    expect(Object.keys(blockSet)).toEqual(["root", "child2"]);
    expect(blockSet.child2.data.delta).toEqual([{ insert: "6" }]);
    expect(options!.selection!.at(0)).toEqual(Entry.create("child2", "T", 0, 0));
  });

  it("last block node", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123" }], parent: "root" },
      },
      child2: {
        id: "child2",
        version: 1,
        // @ts-expect-error ...
        data: { type: "quote", children: ["grandchild2"], parent: "root" },
      },
      grandchild2: {
        id: "grandchild2",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123" }], parent: "child2" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 1),
      Point.create("grandchild2", "T", 2)
    );
    const { options } = editor.perform.deleteFragment(new Range(range))!;
    const blockSet = editor.state.toBlockSet();
    expect(Object.keys(blockSet)).toEqual(["root", "child1"]);
    expect(blockSet.child1.data.delta).toEqual([{ insert: "1" }]);
    expect(options!.selection!.at(0)).toEqual(Entry.create("child1", "T", 1, 0));
  });

  it("all block node", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        // @ts-expect-error ...
        data: { type: "quote", children: ["grandchild1"], parent: "root" },
      },
      grandchild1: {
        id: "grandchild1",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123" }], parent: "child1" },
      },
      child2: {
        id: "child2",
        version: 1,
        // @ts-expect-error ...
        data: { type: "quote", children: ["grandchild2"], parent: "root" },
      },
      grandchild2: {
        id: "grandchild2",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123" }], parent: "child2" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("grandchild1", "T", 1),
      Point.create("grandchild2", "T", 2)
    );
    const { changes, options } = editor.perform.deleteFragment(new Range(range))!;
    const newId = Object.entries(changes).find(([, it]) => it[0].p.length === 0)?.[0];
    const blockSet = editor.state.toBlockSet();
    expect(Object.keys(blockSet)).toEqual(["root", newId]);
    expect(blockSet[newId!].data.delta).toEqual([]);
    expect(options!.selection!.at(0)).toEqual(Entry.create(newId!, "T", 0, 0));
  });
});
