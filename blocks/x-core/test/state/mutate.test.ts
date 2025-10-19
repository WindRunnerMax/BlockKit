import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, createNewBlockChange } from "../../src";
import { createDeleteBlockChange, createInsertBlockChange } from "../../src/state/utils/change";

const blocks: Blocks = {
  root: {
    id: "root",
    version: 1,
    data: { type: "ROOT", children: ["child1", "child2"] },
  },
  child1: {
    id: "child1",
    version: 1,
    data: { type: "text", children: ["grandchild1"], delta: [] },
  },
  child2: {
    id: "child2",
    version: 1,
    data: { type: "text", children: [], delta: [] },
  },
  grandchild1: {
    id: "grandchild1",
    version: 1,
    data: { type: "text", children: [], delta: [] },
  },
};

describe("state mutate", () => {
  it("create block and insert to child2", () => {
    const editor = new BlockEditor({ initial: blocks });
    const newBlockChange = createNewBlockChange(editor, {
      type: "text",
      children: [],
      delta: [],
    });
    const insertBlockChange = createInsertBlockChange("child2", 1, newBlockChange.id);
    editor.state.apply([newBlockChange, insertBlockChange]);
    const newBlocks = editor.state.toBlockSet();
    expect(newBlocks[newBlockChange.id]).toBeDefined();
    expect(newBlocks.child2.data.children).toEqual([newBlockChange.id]);
  });

  it("delete child1", () => {
    const editor = new BlockEditor({ initial: blocks });
    const deleteChange = createDeleteBlockChange(editor, "root", 0);
    editor.state.apply([deleteChange]);
    const newBlocks = editor.state.toBlockSet();
    expect(newBlocks.root.data.children).toEqual(["child2"]);
    expect(newBlocks.child1).toBe(void 0);
    expect(newBlocks.grandchild1).toBe(void 0);
  });
});
