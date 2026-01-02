import type { Blocks } from "@block-kit/x-json";

export const INIT: Blocks = {
  root: {
    id: "root",
    version: 1,
    data: {
      type: "ROOT",
      children: ["h1", "desc", "h2_quote", "quote_container", "h2_bullet", "bullet_l1", "child2"],
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
            "基于 BlockKit 实现的文档编辑器，以 Blocks 的形式组织核心架构，支持复杂的块级结构，以及更高的扩展性。",
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
      children: ["quote_text", "quote_bullet_l1"],
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
  quote_bullet_l1: {
    id: "quote_bullet_l1",
    version: 1,
    data: {
      type: "bullet",
      children: [],
      delta: [{ insert: "可嵌套列表结构" }],
      parent: "quote_container",
    },
  },
  h2_bullet: {
    id: "h2_bullet",
    version: 1,
    data: {
      type: "heading",
      level: "h2",
      children: [],
      delta: [{ insert: "无序列表" }],
      parent: "root",
    },
  },
  bullet_l1: {
    id: "bullet_l1",
    version: 1,
    data: {
      type: "bullet",
      children: ["bullet_l2"],
      delta: [{ insert: "一级无序列表" }],
      parent: "root",
    },
  },
  bullet_l2: {
    id: "bullet_l2",
    version: 1,
    data: {
      type: "bullet",
      children: ["bullet_l3"],
      delta: [{ insert: "二级无序列表" }],
      parent: "bullet_l1",
    },
  },
  bullet_l3: {
    id: "bullet_l3",
    version: 1,
    data: {
      type: "bullet",
      children: [],
      delta: [{ insert: "三级无序列表" }],
      parent: "bullet_l2",
    },
  },
  child2: {
    id: "child2",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "child2" }], parent: "root" },
  },
};
