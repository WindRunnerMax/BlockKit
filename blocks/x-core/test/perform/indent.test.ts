import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, Entry, Range } from "../../src/index";

describe("perform indent", () => {
  it("basic indent", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["child1", "child2"], parent: "" },
      },
      child1: {
        id: "child1",
        version: 1,
        data: { type: "text", children: [], delta: [], parent: "root" },
      },
      child2: {
        id: "child2",
        version: 1,
        data: { type: "text", children: [], delta: [], parent: "root" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const entry = Entry.create("child2", "T", 0, 0);
    editor.perform.indent(new Range(entry));
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.child1.data.children).toEqual(["child2"]);
    expect(blockSet.child2.data.parent).toEqual("child1");
    expect(editor.state.getBlock("child2")?.depth).toEqual(2);
  });

  it("basic unindent", () => {
    const blocks: Blocks = {
      root: {
        id: "root",
        version: 1,
        data: { type: "ROOT", children: ["c1"], parent: "" },
      },
      c1: {
        id: "c1",
        version: 1,
        data: { type: "text", children: ["g1", "g2", "g3"], delta: [], parent: "root" },
      },
      g1: {
        id: "g1",
        version: 1,
        data: { type: "text", children: [], delta: [], parent: "c1" },
      },
      g2: {
        id: "g2",
        version: 1,
        data: { type: "text", children: [], delta: [], parent: "c1" },
      },
      g3: {
        id: "g3",
        version: 1,
        data: { type: "text", children: [], delta: [], parent: "c1" },
      },
    };
    const editor = new BlockEditor({ initial: blocks });
    const entry = Entry.create("g2", "T", 0, 0);
    editor.perform.unindent(new Range(entry));
    const blockSet = editor.state.toBlockSet();
    expect(blockSet.root.data.children).toEqual(["c1", "g2"]);
    expect(blockSet.c1.data.children).toEqual(["g1"]);
    expect(blockSet.g2.data.children).toEqual(["g3"]);
    expect(blockSet.g2.data.parent).toEqual("root");
    expect(editor.state.getBlock("g2")?.depth).toEqual(1);
  });
});
