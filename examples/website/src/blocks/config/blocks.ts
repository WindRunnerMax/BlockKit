import type { Blocks } from "@block-kit/x-json";

export const INIT: Blocks = {
  root: {
    id: "root",
    version: 1,
    data: {
      type: "ROOT",
      children: [
        "h1",
        "links",
        "desc",
        "h2_inline",
        "inline_text",
        "h2_quote",
        "quote_block",
        "h2_bullet",
        "bullet_l1",
        "h2_order",
        "order_l1",
        "h2_code",
        "code_block",
        "h2_table",
        "table_block",
      ],
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
  links: {
    id: "links",
    version: 1,
    data: {
      type: "text",
      parent: "root",
      align: "center",
      delta: [
        {
          attributes: { "link": "https://github.com/WindRunnerMax/BlockKit", "link-blank": "true" },
          insert: "GitHub",
        },
        { insert: " ｜ " },
        {
          attributes: {
            "link": "https://windrunnermax.github.io/BlockKit/blocks.html",
            "link-blank": "true",
          },
          insert: "DEMO",
        },
        { insert: " ｜ " },
        {
          attributes: {
            "link": "https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md",
            "link-blank": "true",
          },
          insert: "NOTE",
        },
        { insert: " ｜ " },
        {
          attributes: {
            "link": "https://github.com/WindRunnerMax/BlockKit/issues/1",
            "link-blank": "true",
          },
          insert: "BLOG",
        },
      ],
      children: [],
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
          insert: "基于",
        },
        {
          attributes: { "inline-code": "true" },
          insert: "BlockKit",
        },
        {
          insert: "实现的文档编辑器，以",
        },
        {
          attributes: { "inline-code": "true" },
          insert: "Blocks",
        },
        { insert: "的形式组织核心架构，支持复杂的块级结构，以及更高的扩展性。" },
      ],
      children: [],
    },
  },

  h2_inline: {
    id: "h2_inline",
    version: 1,
    data: {
      type: "heading",
      level: "h2",
      children: [],
      delta: [{ insert: "内联文本" }],
      parent: "root",
    },
  },
  inline_text: {
    id: "inline_text",
    version: 1,
    data: {
      type: "text",
      parent: "root",
      align: "center",
      delta: [
        { insert: "支持 " },
        { attributes: { bold: "true" }, insert: "加粗" },
        { insert: "、" },
        { attributes: { italic: "true" }, insert: "斜体" },
        { insert: "、" },
        { attributes: { underline: "true" }, insert: "下划线" },
        { insert: "、" },
        { attributes: { strike: "true" }, insert: "删除线" },
        { insert: "、" },
        { attributes: { "inline-code": "true" }, insert: "行内代码" },
        { insert: "、" },
        { insert: "字体颜色", attributes: { color: "rgb(36, 91, 219)" } },
        { insert: "、" },
        { attributes: { background: "rgba(186, 206, 253, 0.7)" }, insert: "背景颜色" },
        { insert: "、" },
        { insert: "字体大小", attributes: { "font-size": "14" } },
        { insert: "、" },
        {
          insert: "超链接",
          attributes: { "link": "https://www.baidu.com", "link-blank": "true" },
        },
        { insert: " 等" },
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
  quote_block: {
    id: "quote_block",
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
      parent: "quote_block",
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
      parent: "quote_block",
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

  h2_order: {
    id: "h2_order",
    version: 1,
    data: {
      type: "heading",
      level: "h2",
      children: [],
      delta: [{ insert: "有序列表" }],
      parent: "root",
    },
  },
  order_l1: {
    id: "order_l1",
    version: 1,
    data: {
      type: "ordered",
      start: -1,
      children: ["order_l2"],
      delta: [{ insert: "一级有序列表" }],
      parent: "root",
    },
  },
  order_l2: {
    id: "order_l2",
    version: 1,
    data: {
      type: "ordered",
      start: -1,
      children: ["order_l3"],
      delta: [{ insert: "二级有序列表" }],
      parent: "order_l1",
    },
  },
  order_l3: {
    id: "order_l3",
    version: 1,
    data: {
      type: "ordered",
      start: -1,
      children: [],
      delta: [{ insert: "三级有序列表" }],
      parent: "order_l2",
    },
  },

  h2_code: {
    id: "h2_code",
    version: 1,
    data: {
      type: "heading",
      level: "h2",
      children: [],
      delta: [{ insert: "代码块" }],
      parent: "root",
    },
  },
  code_block: {
    id: "code_block",
    version: 1,
    data: {
      type: "code",
      parent: "root",
      children: [],
      language: "JavaScript",
      delta: [{ insert: "const a = 1;\nconst b = 2;" }],
    },
  },

  h2_table: {
    id: "h2_table",
    version: 1,
    data: {
      type: "heading",
      level: "h2",
      children: [],
      delta: [{ insert: "表格块" }],
      parent: "root",
    },
  },
  table_block: {
    id: "table_block",
    version: 1,
    data: {
      type: "table",
      parent: "root",
      size: [3, 2],
      config: [{ width: 300 }, { width: 300 }],
      children: ["cell_1_1", "cell_1_2", "cell_2_1", "cell_2_2", "cell_3_1", "cell_3_2"],
    },
  },
  cell_1_1: {
    id: "cell_1_1",
    version: 1,
    data: {
      type: "table-cell",
      parent: "table_block",
      children: ["cell_1_1_text"],
    },
  },
  cell_1_1_text: {
    id: "cell_1_1_text",
    version: 1,
    data: {
      type: "text",
      parent: "cell_1_1",
      children: [],
      delta: [{ insert: "单元格1" }],
    },
  },
  cell_1_2: {
    id: "cell_1_2",
    version: 1,
    data: {
      type: "table-cell",
      parent: "table_block",
      children: ["cell_1_2_text"],
    },
  },
  cell_1_2_text: {
    id: "cell_1_2_text",
    version: 1,
    data: {
      type: "text",
      parent: "cell_1_2",
      children: [],
      delta: [{ insert: "单元格2" }],
    },
  },
  cell_2_1: {
    id: "cell_2_1",
    version: 1,
    data: {
      type: "table-cell",
      parent: "table_block",
      children: ["cell_2_1_text"],
    },
  },
  cell_2_1_text: {
    id: "cell_2_1_text",
    version: 1,
    data: {
      type: "text",
      parent: "cell_2_1",
      children: [],
      delta: [{ insert: "单元格3" }],
    },
  },
  cell_2_2: {
    id: "cell_2_2",
    version: 1,
    data: {
      type: "table-cell",
      parent: "table_block",
      children: ["cell_2_2_text"],
    },
  },
  cell_2_2_text: {
    id: "cell_2_2_text",
    version: 1,
    data: {
      type: "text",
      parent: "cell_2_2",
      children: [],
      delta: [{ insert: "单元格4" }],
    },
  },
  cell_3_1: {
    id: "cell_3_1",
    version: 1,
    data: {
      type: "table-cell",
      parent: "table_block",
      children: ["cell_3_1_text"],
    },
  },
  cell_3_1_text: {
    id: "cell_3_1_text",
    version: 1,
    data: {
      type: "text",
      parent: "cell_3_1",
      children: [],
      delta: [{ insert: "单元格5" }],
    },
  },
  cell_3_2: {
    id: "cell_3_2",
    version: 1,
    data: {
      type: "table-cell",
      parent: "table_block",
      children: ["cell_3_2_text"],
    },
  },
  cell_3_2_text: {
    id: "cell_3_2_text",
    version: 1,
    data: {
      type: "text",
      parent: "cell_3_2",
      children: [],
      delta: [{ insert: "单元格6" }],
    },
  },
};
