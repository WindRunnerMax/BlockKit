import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, normalizeModelRange, Point, Range } from "../../src";

// - A
//   - B
//     - C
//       - D
//         - E
//       - F
//     - G
//   - H
// - I
const getBlocks = (): Blocks => ({
  root: {
    id: "root",
    version: 1,
    data: { type: "ROOT", children: ["A", "I"], parent: "" },
  },
  A: {
    id: "A",
    version: 1,
    data: { type: "text", children: ["B", "H"], delta: [{ insert: "A" }], parent: "root" },
  },
  B: {
    id: "B",
    version: 1,
    data: { type: "text", children: ["C", "G"], delta: [{ insert: "B" }], parent: "A" },
  },
  C: {
    id: "C",
    version: 1,
    data: { type: "text", children: ["D", "F"], delta: [{ insert: "C" }], parent: "B" },
  },
  D: {
    id: "D",
    version: 1,
    data: { type: "text", children: ["E"], delta: [{ insert: "D" }], parent: "C" },
  },
  E: {
    id: "E",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "E" }], parent: "D" },
  },
  F: {
    id: "F",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "F" }], parent: "C" },
  },
  G: {
    id: "G",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "G" }], parent: "B" },
  },
  H: {
    id: "H",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "H" }], parent: "A" },
  },
  I: {
    id: "I",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "I" }], parent: "root" },
  },
});

describe("perform delete-tree", () => {
  it("text tree sub nodes", () => {
    // 从 B 前删除到 C, 子节点中未删除的节点需要组合到 B 中
    // 因此从 B 开始到同层级 H 结束间的所有节点作为 B 的子节点
    // 即 (B, H) 且不包括两端节点, 注意是 B 直属子节点起始, 不需要递归处理
    // - A                         // - A
    //   - |B                      //   - |
    //     - C|                    //     - D
    //       - D                   //       - E
    //         - E                 //     - F
    //       - F                   //     - G
    //     - G                     //   - H
    //   - H                       // - I
    // - I
    const editor = new BlockEditor({ initial: getBlocks() });
    const range = normalizeModelRange(editor, Point.create("B", "T", 0), Point.create("C", "T", 1));
    const res = editor.perform.deleteFragment(new Range(range))!;
    editor.perform.applyChanges(res);
    const blockSet = editor.state.toBlockSet();
    expect(Object.keys(blockSet)).toEqual(["A", "B", "D", "E", "F", "G", "H", "I"]);
    expect(blockSet.A.data.children).toEqual(["B", "H"]);
    expect(blockSet.B.data.children).toEqual(["D", "F", "G"]);
    expect(blockSet.D.data.children).toEqual(["E"]);
  });
});
