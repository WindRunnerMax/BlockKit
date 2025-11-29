import type { Blocks } from "@block-kit/x-json";

import { BlockEditor } from "../../src/editor";

//         A
//      /  |  \
//     B   D   G
//    /   / \   \
//   C   E   F   H
const getBlocks = (): Blocks => ({
  A: {
    id: "A",
    version: 1,
    data: { type: "ROOT", children: ["B", "D", "G"], parent: "" },
  },
  B: {
    id: "B",
    version: 1,
    data: { type: "text", children: ["C"], delta: [], parent: "A" },
  },
  C: {
    id: "C",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "B" },
  },
  D: {
    id: "D",
    version: 1,
    data: { type: "text", children: ["E", "F"], delta: [], parent: "A" },
  },
  G: {
    id: "G",
    version: 1,
    // @ts-expect-error quote
    data: { type: "quote", children: ["H"], parent: "A" },
  },
  H: {
    id: "H",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "G" },
  },
});

describe("lookup ops", () => {
  it("get prev sibling node", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const state = editor.state;
    expect(state.getBlock("A")?.prevSiblingNode()?.id).toBe(void 0);
    expect(state.getBlock("B")?.prevSiblingNode()?.id).toBe("A");
    expect(state.getBlock("C")?.prevSiblingNode()?.id).toBe("B");
    expect(state.getBlock("D")?.prevSiblingNode()?.id).toBe("C");
    expect(state.getBlock("E")?.prevSiblingNode()?.id).toBe("D");
    expect(state.getBlock("F")?.prevSiblingNode()?.id).toBe("E");
    expect(state.getBlock("G")?.prevSiblingNode()?.id).toBe("F");
    expect(state.getBlock("H")?.prevSiblingNode()?.id).toBe("G");
    expect(state.getBlock("H")?.prevSiblingNode(!0)?.id).toBe("F");
  });

  it("get next sibling node", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const state = editor.state;
    expect(state.getBlock("A")?.nextSiblingNode()?.id).toBe("B");
    expect(state.getBlock("B")?.nextSiblingNode()?.id).toBe("C");
    expect(state.getBlock("C")?.nextSiblingNode()?.id).toBe("D");
    expect(state.getBlock("D")?.nextSiblingNode()?.id).toBe("E");
    expect(state.getBlock("E")?.nextSiblingNode()?.id).toBe("F");
    expect(state.getBlock("F")?.nextSiblingNode()?.id).toBe("G");
    expect(state.getBlock("F")?.nextSiblingNode(!0)?.id).toBe("H");
    expect(state.getBlock("G")?.nextSiblingNode()?.id).toBe("H");
    expect(state.getBlock("H")?.nextSiblingNode()?.id).toBe(void 0);
  });
});
