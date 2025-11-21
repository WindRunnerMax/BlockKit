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
    const { changes, options } = editor.perform.deleteFragment(new Range(range))!;
    editor.state.apply(changes, options);
    const blockSet = editor.state.toBlockSet();
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
    const { changes, options } = editor.perform.deleteFragment(new Range(range))!;
    editor.state.apply(changes, options);
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.delta).toEqual([{ insert: "16" }]);
    expect(options!.selection!.at(0)).toEqual(Entry.create("child1", "T", 1, 0));
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
    const { changes, options } = editor.perform.deleteFragment(new Range(range))!;
    editor.state.apply(changes, options);
    const blockSet = editor.state.toBlockSet();
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
    const { changes, options } = editor.perform.deleteFragment(new Range(range))!;
    editor.state.apply(changes, options);
    const blockSet = editor.state.toBlockSet();
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
    const newId = changes.flat().find(it => it.ops[0].p.length === 0)?.id;
    editor.state.apply(changes, options);
    const blockSet = editor.state.toBlockSet();
    expect(blockSet[newId!].data.delta).toEqual([]);
    expect(options!.selection!.at(0)).toEqual(Entry.create(newId!, "T", 0, 0));
  });
});
