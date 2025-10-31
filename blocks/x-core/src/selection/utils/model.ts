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
import { getLowestCommonAncestor } from "../../state/utils/tree";
import { Entry } from "../modules/entry";
import { Point } from "../modules/point";
import { Range } from "../modules/range";
import type { BlockPoint, RangeEntry, RangePoint } from "../types";
import { BLOCK_TYPE } from "./constant";

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
): RangePoint | null => {
  const { node, offset } = domPoint;
  const isTextNode = isClosestTo(node, `[${BLOCK_KEY}]`);
  const xBlock = closestTo(node, `[${X_BLOCK_ID_KEY}]`);
  if (!xBlock || !node) return null;
  const { TEXT, BLOCK } = BLOCK_TYPE;
  const id = xBlock.getAttribute(X_BLOCK_ID_KEY)!;
  const blockState = isTextNode && editor.state.getBlock(id);
  const text = blockState && editor.model.getTextEditor(blockState);
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
      return { id, type: TEXT, offset: raw.offset };
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
  let startRangePoint: RangePoint | null;
  let endRangePoint: RangePoint | null;
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
 * - 务必注意 start 必须要在 end 节点前
 * @param start
 * @param end
 */
export const normalizeModelRange = (
  editor: BlockEditor,
  start: RangePoint,
  end: RangePoint
): RangeEntry[] => {
  const startState = editor.state.getBlock(start.id);
  const endState = editor.state.getBlock(end.id);
  if (!startState || !endState) return [];
  const { TEXT, BLOCK } = BLOCK_TYPE;
  // ============== 同节点情况 ==============
  // 如果 id 相同, 则为相同的块节点
  if (start.id === end.id) {
    return start.type === BLOCK || end.type === BLOCK
      ? [Entry.fromPoint(start as BlockPoint)]
      : [Entry.fromPoint(start, start.offset, end.offset - start.offset)];
  }
  const startDepth = startState.depth;
  const endDepth = endState.depth;
  const startIndex = startState.index;
  const endIndex = endState.index;
  const startParent = startState.parent;
  const endParent = endState.parent;
  const startRangeItem: RangeEntry = Point.isBlockPoint(start)
    ? Entry.fromPoint(start)
    : Entry.fromPoint(start, start.offset, startState.length - start.offset);
  const endRangeItem: RangeEntry = Point.isBlockPoint(end)
    ? Entry.fromPoint(end)
    : Entry.fromPoint(end, 0, end.offset);
  // ============== 同父节点情况 ==============
  // 如果端点深度相同, 且父节点相同, 则直接遍历同级节点
  if (startDepth === endDepth && startParent && startParent === endParent) {
    const children = startParent.data.children || [];
    const between = children.slice(startIndex + 1, endIndex).map(id => {
      const block = editor.state.getBlock(id);
      if (!block || !block.data.delta) return Entry.create(id, BLOCK);
      const len = block.length!;
      return Entry.create(id, TEXT, 0, len);
    });
    return [startRangeItem, ...between, endRangeItem];
  }
  // ============== 不同深度情况 ==============
  // 如果端点深度不同, 则更复杂, 需要提升到同一父节点上处理, DFS 序
  const lca = getLowestCommonAncestor(startState, endState);
  if (!lca) return [];
  const nodes = lca.getTreeNodes();
  const between: RangeEntry[] = [];
  let isInsideNode = false;
  for (const node of nodes) {
    if (node.id === start.id) {
      isInsideNode = true;
      continue;
    }
    if (node.id === end.id) {
      break;
    }
    if (!isInsideNode) {
      continue;
    }
    if (!node.data.delta) {
      between.push(Entry.create(node.id, BLOCK));
    } else {
      const len = node.length;
      between.push(Entry.create(node.id, TEXT, 0, len));
    }
  }
  return [startRangeItem, ...between, endRangeItem];
};
