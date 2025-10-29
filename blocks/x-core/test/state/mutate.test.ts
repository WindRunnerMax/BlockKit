import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, createNewBlockChange } from "../../src";
import { createDeleteBlockChange, createInsertBlockChange } from "../../src/state/utils/change";

const getBlocks = (): Blocks => ({
  root: {
    id: "root",
    version: 1,
    data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
  },
  child1: {
    id: "child1",
    version: 1,
    data: { type: "text", children: ["grandchild1"], delta: [], parent: "root" },
  },
  child2: {
    id: "child2",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "root" },
  },
  grandchild1: {
    id: "grandchild1",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "child1" },
  },
});

describe("state mutate", () => {
  it("create block and insert to child2", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const newBlockChange = createNewBlockChange(editor, { type: "text", children: [], delta: [] });
    const insertBlockChange = createInsertBlockChange("child2", 0, newBlockChange);
    editor.state.apply([newBlockChange, insertBlockChange]);
    const newBlocks = editor.state.toBlockSet();
    expect(newBlocks[newBlockChange.id]).toBeDefined();
    expect(newBlocks.child2.data.children).toEqual([newBlockChange.id]);
    expect(editor.state.blocks.child2.index).toBe(1);
    expect(editor.state.blocks[newBlockChange.id].index).toBe(0);
    expect(editor.state.blocks[newBlockChange.id].depth).toBe(2);
  });

  it("delete child1", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const deleteChange = createDeleteBlockChange(editor, "root", 0);
    editor.state.apply([deleteChange]);
    const newBlocks = editor.state.toBlockSet();
    expect(newBlocks.root.data.children).toEqual(["child2"]);
    expect(newBlocks.child1).toBe(void 0);
    expect(newBlocks.grandchild1).toBe(void 0);
    expect(editor.state.blocks.child2.index).toBe(0);
  });
});
