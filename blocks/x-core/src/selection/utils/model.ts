import type { DOMPoint, NormalizePointContext } from "@block-kit/core";
import {
  BLOCK_KEY,
  closestTo,
  isClosestTo,
  normalizeDOMPoint,
  toModelPoint as toTextModelPoint,
} from "@block-kit/core";
import { RawPoint } from "@block-kit/core";

import type { BlockEditor } from "../../editor";
import { X_BLOCK_ID_KEY } from "../../model/types";
import { Range } from "../modules/range";
import type { RangeNode } from "../types";
import { POINT_TYPE } from "./constant";

/**
 * 将 DOMPoint 转换为 ModelPoint
 * @param editor
 * @param domPoint
 * @param context
 */
export const toModelPoint = (
  editor: BlockEditor,
  domPoint: DOMPoint,
  context: NormalizePointContext
): RangeNode | null => {
  const { node, offset } = domPoint;
  const isTextNode = isClosestTo(node, `[${BLOCK_KEY}]`);
  const xBlock = closestTo(node, `[${X_BLOCK_ID_KEY}]`);
  if (!xBlock || !node) return null;
  const { TEXT, BLOCK } = POINT_TYPE;
  const id = xBlock.getAttribute(X_BLOCK_ID_KEY)!;
  const blockState = isTextNode && editor.state.getBlock(id);
  const text = blockState && blockState.getTextEditor();
  // 如果是文本类型的块节点
  if (isTextNode && text) {
    const startDOMPoint = normalizeDOMPoint(domPoint, context);
    const startRangePoint = toTextModelPoint(text, startDOMPoint, {
      ...context,
      nodeContainer: node,
      nodeOffset: offset,
    });
    const raw = RawPoint.fromPoint(text, startRangePoint);
    if (raw) {
      return { id, type: TEXT, start: raw.offset, len: 0 };
    }
  }
  // 否则作为块节点处理
  return { id, type: BLOCK };
};

/**
 * 将 DOMStaticRange 转换为 ModelRange
 * @param editor
 * @param staticSel
 * @param isBackward
 */
export const toModelRange = (editor: BlockEditor, staticSel: StaticRange, isBackward: boolean) => {
  const { startContainer, endContainer, collapsed, startOffset, endOffset } = staticSel;
  let startRangePoint: RangeNode | null;
  let endRangePoint: RangeNode | null;
  if (!collapsed) {
    const startPoint = { node: startContainer, offset: startOffset };
    const endPoint = { node: endContainer, offset: endOffset };
    startRangePoint = toModelPoint(editor, startPoint, {
      isCollapsed: false,
      isEndNode: false,
    });
    endRangePoint = toModelPoint(editor, endPoint, {
      isCollapsed: false,
      isEndNode: true,
    });
  } else {
    const domPoint = { node: startContainer, offset: startOffset };
    startRangePoint = toModelPoint(editor, domPoint, {
      isCollapsed: true,
      isEndNode: false,
    });
    endRangePoint = Object.assign({}, startRangePoint);
  }
  if (!startRangePoint || !endRangePoint) {
    return null;
  }
  const nodes = normalizeModelRange(editor, startRangePoint, endRangePoint);
  return new Range(nodes, isBackward);
};

/**
 * 将 RangeNode 转换为 Range
 * @param start
 * @param end
 */
export const normalizeModelRange = (
  editor: BlockEditor,
  start: RangeNode,
  end: RangeNode
): RangeNode[] => {
  const startState = editor.state.getBlock(start.id);
  const endState = editor.state.getBlock(end.id);
  if (!startState || !endState) return [];
  const { TEXT, BLOCK } = POINT_TYPE;
  // 如果 id 相同, 则为独立的节点
  if (start.id === end.id) {
    return start.type === BLOCK || end.type === BLOCK
      ? [start]
      : [{ id: start.id, type: TEXT, start: start.start, len: end.start - start.start }];
  }
  const startDepth = startState.depth;
  const endDepth = endState.depth;
  const startIndex = startState.index;
  const endIndex = endState.index;
  const startParent = startState.getParent();
  const endParent = endState.getParent();
  // 如果端点深度相同, 且父节点相同, 则直接遍历同级节点
  if (startDepth === endDepth && startParent && startParent === endParent) {
    const children = startParent.data.children || [];
    const between = children.slice(startIndex + 1, endIndex).map(id => {
      const block = editor.state.getBlock(id);
      if (!block || !block.data.delta) return { id, type: BLOCK };
      const len = block.getTextLength()!;
      return { id, type: TEXT, start: 0, len };
    });
    return [start, ...between, end];
  }
  return [];
};
