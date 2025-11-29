import type { Blocks } from "@block-kit/x-json";

import { BlockEditor } from "../../src/editor";

const getBlocks = (): Blocks => ({
  root: {
    id: "root",
    version: 1,
    data: { type: "ROOT", children: ["child1"], parent: "" },
  },
  child1: {
    id: "child1",
    version: 1,
    data: {
      type: "text",
      children: [],
      delta: [
        { insert: "text", attributes: { inline: "true" } },
        { insert: "text2", attributes: { bold: "true", inline: "true" } },
        { insert: "text3", attributes: { bold: "true" } },
      ],
      parent: "root",
    },
  },
});

describe("lookup ops", () => {
  it("get leaf at offset", () => {
    const blocks = getBlocks();
    const editor = new BlockEditor({ initial: blocks });
    const meta = editor.lookup.getLeafAtOffset("child1", 5);
    expect(meta).toEqual({
      op: { insert: "text2", attributes: { bold: "true", inline: "true" } },
      ops: blocks.child1.data.delta,
      index: 1,
      length: 5,
      offset: 1,
      tail: false,
    });
  });

  it("get leaf at offset tail", () => {
    const blocks = getBlocks();
    const editor = new BlockEditor({ initial: blocks });
    const meta = editor.lookup.getLeafAtOffset("child1", 9);
    expect(meta).toEqual({
      op: { insert: "text2", attributes: { bold: "true", inline: "true" } },
      ops: blocks.child1.data.delta,
      index: 1,
      length: 5,
      offset: 5,
      tail: true,
    });
  });

  it("get backward op at offset", () => {
    const blocks = getBlocks();
    const editor = new BlockEditor({ initial: blocks });
    const op = editor.lookup.getBackwardOpAtOffset("child1", 7);
    expect(op).toEqual({ insert: "tex", attributes: { bold: "true", inline: "true" } });
  });
});
