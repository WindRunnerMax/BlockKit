import type { Object } from "@block-kit/utils";

/** 方向 */
export const DIRECTION = {
  FORWARD: "forward",
  BACKWARD: "backward",
} as const;

/** 变更类型 */
export const ALERT = {
  MOVE: "move",
  EXTEND: "extend",
} as const;

/** 调整粒度 */
export const GRANULARITY = {
  CHARACTER: "character",
  WORD: "word",
  LINE: "line",
} as const;

/** 节点 */
export type DOMPoint = {
  node: Node | null;
  offset: number;
};

/** 标准化节点运行环境 */
export type NormalizePointContext = {
  /** 是否折叠 */
  isCollapsed: boolean;
  /** 是否是末尾节点(EndDOMPoint) */
  isEndNode: boolean;
};

/** 编辑器节点运行环境 */
export type ModelPointContext = {
  /** 是否折叠 */
  isCollapsed: boolean;
  /** 是否是末尾节点(EndDOMPoint) */
  isEndNode: boolean;
  /** 原始选区容器 */
  nodeContainer: Node;
  /** 原始选区偏移 */
  nodeOffset: number;
};

// NodeType https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
export type DOMRange = globalThis.Range;
export type DOMSelection = globalThis.Selection;
export type DOMStaticRange = globalThis.StaticRange;
export type Direction = Object.Values<typeof DIRECTION>;
export type DOMComment = globalThis.Comment;
export type DOMNode = globalThis.Node;
export type DOMText = globalThis.Text;
export type DOMElement = globalThis.Element;
