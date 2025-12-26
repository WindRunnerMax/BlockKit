import type { Blocks } from "@block-kit/x-json";

export const INIT: Blocks = {
  root: {
    id: "root",
    version: 1,
    data: {
      type: "ROOT",
      children: ["h1", "desc", "h2_quote", "quote_container", "child1", "child2"],
      parent: "",
    },
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
  desc: {
    id: "desc",
    version: 1,
    data: {
      type: "text",
      parent: "root",
      delta: [
        {
          insert:
            "基于 BlockKit 实现的文档编辑器，以 Block 的形式组织核心架构，支持复杂的块级结构，以及更高的扩展性。",
        },
      ],
      children: [],
    },
  },
  h2_quote: {
    id: "h2_quote",
    version: 1,
    data: {
      type: "heading",
      level: "h2",
      children: [],
      delta: [{ insert: "引用块" }],
      parent: "root",
    },
  },
  quote_container: {
    id: "quote_container",
    version: 1,
    data: {
      type: "quote",
      parent: "root",
      children: ["quote_text"],
    },
  },
  quote_text: {
    id: "quote_text",
    version: 1,
    data: {
      type: "text",
      parent: "quote_container",
      children: [],
      delta: [{ insert: "引用内容" }],
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
