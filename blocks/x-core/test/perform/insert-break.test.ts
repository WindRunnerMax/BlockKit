import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, Entry, normalizeModelRange, Point, Range } from "../../src";

describe("perform insert break", () => {
  it("basic insert break", () => {
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
      Point.create("child1", "T", 1)
    );
    const { changes, options } = editor.perform.insertBreak(new Range(range))!;
    const newId = Object.entries(changes).find(([, it]) => it[0].p.length === 0)?.[0];
    const blockSet = editor.state.toBlockSet();
    expect(Object.keys(blockSet)).toEqual(["root", "child1", newId!]);
    expect(blockSet.child1.data.delta).toEqual([{ insert: "1" }]);
    expect(blockSet[newId!].data.delta).toEqual([{ insert: "23" }]);
    expect(options!.selection!.at(0)).toEqual(Entry.create(newId!, "T", 0, 0));
  });

  it("insert break with del", () => {
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
    const { changes, options } = editor.perform.insertBreak(new Range(range))!;
    const newId = Object.entries(changes).find(([, it]) => it[0].p.length === 0)?.[0];
    expect(changes.child1[0].o).toEqual([{ retain: 1 }, { delete: 1 }]);
    const blockSet = editor.state.toBlockSet();
    expect(Object.keys(blockSet)).toEqual(["root", "child1", newId!]);
    expect(blockSet.child1.data.delta).toEqual([{ insert: "1" }]);
    expect(blockSet[newId!].data.delta).toEqual([{ insert: "3" }]);
    expect(options!.selection!.at(0)).toEqual(Entry.create(newId!, "T", 0, 0));
  });

  it("insert break with cross line del", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "123456" }], parent: "root" },
      },
      child2: {
        id: "child2",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "789" }], parent: "root" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 1),
      Point.create("child2", "T", 2)
    );
    const { changes } = editor.perform.insertBreak(new Range(range))!;
    const blockSet = editor.state.toBlockSet();
    const newId = Object.entries(changes).find(([, it]) => it[0].p.length === 0)?.[0];
    expect(blockSet.child1.data.delta?.[0]).toEqual({ insert: "1" });
    expect(blockSet[newId!].data.delta?.[0]).toEqual({ insert: "9" });
  });

  it("insert break with cross line with children", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: {
          type: "text",
          children: ["grandchild1"],
          delta: [{ insert: "child1" }],
          parent: "root",
        },
      },
      child2: {
        id: "child2",
        version: 1,
        data: { type: "text", children: [], delta: [{ insert: "child2" }], parent: "root" },
      },
      grandchild1: {
        id: "grandchild1",
        version: 1,
        data: {
          type: "text",
          children: ["grandgrandchild1"],
          delta: [{ insert: "grandchild1" }],
          parent: "child1",
        },
      },
      grandgrandchild1: {
        id: "grandgrandchild1",
        version: 1,
        data: {
          type: "text",
          children: [],
          delta: [{ insert: "grandgrandchild1" }],
          parent: "child1",
        },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const range = normalizeModelRange(
      editor,
      Point.create("child1", "T", 3),
      Point.create("grandchild1", "T", 5)
    );
    const { changes } = editor.perform.insertBreak(new Range(range))!;
    const blockSet = editor.state.toBlockSet();
    const newId = Object.entries(changes).find(([, it]) => it[0].p.length === 0)?.[0];
    expect(Object.keys(blockSet)).toEqual(["root", "child1", "child2", "grandgrandchild1", newId]);
    expect(blockSet.child1.data.delta).toEqual([{ insert: "chi" }]);
    expect(blockSet[newId!].data.delta).toEqual([{ insert: "child1" }]);
    expect(blockSet.child1.data.children).toEqual([newId, "grandgrandchild1"]);
    expect(blockSet.root.data.children).toEqual(["child1", "child2"]);
  });
});
