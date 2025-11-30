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
    const newId = changes.flat().find(it => it.ops[0].p.length === 0)?.id;
    editor.state.apply(changes, options);
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
    const newId = changes.flat().find(it => it.ops[0].p.length === 0)?.id;
    const res = editor.state.apply(changes, options);
    expect(res.changes.child1[0].o).toEqual([{ retain: 1 }, { delete: 1 }]);
    expect(res.changes.child1[1].o).toEqual([{ retain: 1 }, { delete: 1 }]);
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
    const { changes, options } = editor.perform.insertBreak(new Range(range))!;
    editor.state.apply(changes, options);
  });
});
