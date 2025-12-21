import type { Blocks } from "@block-kit/x-json";

export const INIT: Blocks = {
  root: {
    id: "root",
    version: 1,
    data: { type: "ROOT", children: ["h1", "child1", "child2"], parent: "" },
  },
  h1: {
    id: "h1",
    version: 1,
    data: {
      type: "heading",
      level: "h1",
      children: [],
      align: "center",
      delta: [{ insert: "BlockKitX" }],
      parent: "root",
    },
  },
  child1: {
    id: "child1",
    version: 1,
    data: {
      type: "text",
      children: ["grandchild1"],
      delta: [{ insert: "child1" }],
      parent: "root",
    },
  },
  child2: {
    id: "child2",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "child2" }], parent: "root" },
  },
  grandchild1: {
    id: "grandchild1",
    version: 1,
    data: {
      type: "text",
      children: ["grandgrandchild1"],
      delta: [{ insert: "grandchild1" }],
      parent: "child1",
    },
  },
  grandgrandchild1: {
    id: "grandgrandchild1",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "grandgrandchild1" }], parent: "child1" },
  },
};
