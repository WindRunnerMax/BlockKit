import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, Entry, Range } from "../../src";

describe("history undo-redo", () => {
  it("batch undo auto compose", () => {
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
    const entry = Entry.create("child1", "T", 3, 0);
    editor.selection.set(new Range(entry));
    editor.perform.insertBreak(editor.selection.get()!);
    editor.perform.insertBreak(editor.selection.get()!);
    editor.perform.insertBreak(editor.selection.get()!);
    // @ts-expect-error protected property
    const stack = editor.history.undoStack;
    expect(stack[0].id.size).toBe(3);
    expect(stack[0].range?.at(0)).toEqual(Entry.create("child1", "T", 3, 0));
    editor.history.undo();
    expect(editor.selection.get()).toEqual(new Range(Entry.create("child1", "T", 3, 0)));
    const blockSet = editor.state.toBlockSet();
    expect(Object.keys(blockSet).length).toBe(2);
    expect(blockSet.child1.data.delta).toEqual([{ insert: "123456" }]);
  });

  it("batch undo -> redo selection", () => {
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
    const entry = Entry.create("child1", "T", 3, 0);
    editor.selection.set(new Range(entry));
    editor.perform.insertBreak(editor.selection.get()!);
    editor.perform.insertBreak(editor.selection.get()!);
    editor.perform.insertBreak(editor.selection.get()!);
    editor.history.undo();
    // @ts-expect-error protected property
    const stack = editor.history.redoStack;
    expect(stack[0]).toBeTruthy();
  });
});
