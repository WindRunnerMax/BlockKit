import { Delta } from "@block-kit/delta";
import type { Blocks } from "@block-kit/x-json";

import { BlockEditor } from "../../src/editor";

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
    const atom = editor.perform.atom;
    const newBlockChange = atom.create({ type: "text", children: [], delta: [] });
    const insertBlockChange = atom.insert("child2", 0, newBlockChange);
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
    const atom = editor.perform.atom;
    const deleteChange = atom.remove("root", 0);
    editor.state.apply([deleteChange]);
    const newBlocks = editor.state.toBlockSet();
    expect(newBlocks.root.data.children).toEqual(["child2"]);
    expect(newBlocks.child1).toBe(void 0);
    // 这里的判断需要注意, 文本级别的删除是存在未删除的子节点位置移动情况的
    // 因此, 这里的文本节点仍然存在, 在真正删除的情况下应该是挂在起始的父节点上
    expect(newBlocks.grandchild1).toBeTruthy();
    expect(editor.state.blocks.child2.index).toBe(0);
  });

  it("children reference keep", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const atom = editor.perform.atom;
    const change = atom.updateText("child1", new Delta().insert("hello"));
    const children1 = editor.state.blocks.child1.data.children;
    editor.state.apply([change]);
    expect(editor.state.blocks.child1.data.children).toBe(children1);
  });

  it("children reference change", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const atom = editor.perform.atom;
    const change = atom.remove("root", 0);
    const children1 = editor.state.blocks.root.data.children;
    editor.state.apply([change]);
    expect(editor.state.blocks.root.data.children).not.toBe(children1);
  });

  it("text delta reference keep", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const atom = editor.perform.atom;
    const change = atom.remove("root", 0);
    const delta1 = editor.state.blocks.root.data.delta;
    editor.state.apply([change]);
    expect(editor.state.blocks.root.data.delta).toBe(delta1);
  });

  it("text delta reference change", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const atom = editor.perform.atom;
    const change = atom.updateText("child1", new Delta().insert("hello"));
    const delta1 = editor.state.blocks.child1.data.delta;
    editor.state.apply([change]);
    expect(editor.state.blocks.child1.data.delta).not.toBe(delta1);
  });
});
