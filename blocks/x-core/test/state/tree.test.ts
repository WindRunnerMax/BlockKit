import type { Blocks } from "@block-kit/x-json";

import { BlockEditor } from "../../src";

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

describe("state tree", () => {
  it("tree flat nodes", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const root = editor.state.getBlock("root")!;
    const child1 = editor.state.getBlock("child1")!;
    const grandchild1 = editor.state.getBlock("grandchild1")!;
    const child2 = editor.state.getBlock("child2")!;
    const rootNodes = root.getTreeNodes().map(it => it.id);
    expect(rootNodes).toEqual(["root", "child1", "grandchild1", "child2"]);
    expect(child1._nodes?.map(it => it.id)).toEqual(["child1", "grandchild1"]);
    expect(grandchild1._nodes?.map(it => it.id)).toEqual(["grandchild1"]);
    expect(child2._nodes?.map(it => it.id)).toEqual(["child2"]);
  });

  it("tree flat nodes apply insert change", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const atom = editor.perform.atom;
    const newBlockChange = atom.create({ type: "text", children: [], delta: [] });
    newBlockChange.id = "grandchild0";
    const insertBlockChange = atom.insert("child1", 0, newBlockChange);
    editor.state.apply([newBlockChange, insertBlockChange]);
    const root = editor.state.getBlock("root")!;
    const child1 = editor.state.getBlock("child1")!;
    const grandchild1 = editor.state.getBlock("grandchild1")!;
    const child2 = editor.state.getBlock("child2")!;
    const rootNodes = root.getTreeNodes().map(it => it.id);
    expect(rootNodes).toEqual(["root", "child1", "grandchild0", "grandchild1", "child2"]);
    expect(child1._nodes?.map(it => it.id)).toEqual(["child1", "grandchild0", "grandchild1"]);
    expect(grandchild1._nodes?.map(it => it.id)).toEqual(["grandchild1"]);
    expect(child2._nodes?.map(it => it.id)).toEqual(["child2"]);
  });

  it("tree depth", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    expect(editor.state.getBlock("root")!.depth).toBe(0);
    expect(editor.state.getBlock("child1")!.depth).toBe(1);
    expect(editor.state.getBlock("grandchild1")!.depth).toBe(2);
    expect(editor.state.getBlock("child2")!.depth).toBe(1);
  });

  it("tree depth apply insert change", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const atom = editor.perform.atom;
    const newBlockChange = atom.create({ type: "text", children: [], delta: [] });
    newBlockChange.id = "grandchild0";
    const insertBlockChange = atom.insert("child1", 0, newBlockChange);
    editor.state.apply([newBlockChange, insertBlockChange]);
    expect(editor.state.getBlock("root")!.depth).toBe(0);
    expect(editor.state.getBlock("child1")!.depth).toBe(1);
    expect(editor.state.getBlock("grandchild0")!.depth).toBe(2);
    expect(editor.state.getBlock("grandchild1")!.depth).toBe(2);
    expect(editor.state.getBlock("child2")!.depth).toBe(1);
  });

  it("tree list index", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    expect(editor.state.getBlock("root")!.index).toBe(-1);
    expect(editor.state.getBlock("child1")!.index).toBe(0);
    expect(editor.state.getBlock("grandchild1")!.index).toBe(0);
    expect(editor.state.getBlock("child2")!.depth).toBe(1);
  });

  it("tree depth apply insert change", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const atom = editor.perform.atom;
    const newBlockChange = atom.create({ type: "text", children: [], delta: [] });
    newBlockChange.id = "grandchild0";
    const insertBlockChange = atom.insert("child1", 0, newBlockChange);
    editor.state.apply([newBlockChange, insertBlockChange]);
    expect(editor.state.getBlock("root")!.index).toBe(-1);
    expect(editor.state.getBlock("child1")!.index).toBe(0);
    expect(editor.state.getBlock("grandchild0")!.index).toBe(0);
    expect(editor.state.getBlock("grandchild1")!.index).toBe(1);
    expect(editor.state.getBlock("child2")!.depth).toBe(1);
  });
});
