import type { DOMPoint, DOMRange, NormalizePointContext } from "@block-kit/core";
import { getTextNode, toDOMPoint as toTextDOMPoint } from "@block-kit/core";
import { RawPoint } from "@block-kit/core";
import { Point as TextPoint } from "@block-kit/core";
import { isDOMElement } from "@block-kit/utils";

import type { BlockEditor } from "../../editor";
import { X_SELECTION_KEY } from "../../model/types";
import { getBlockEndTextNode, getBlockStartTextNode } from "../../model/utils/dom";
import { isVoidBlockType } from "../../schema/utils/is";
import { Entry } from "../modules/entry";
import { Point } from "../modules/point";
import type { Range } from "../modules/range";
import type { RangePoint } from "../types";
import { POINT_TYPE } from "./constant";

/**
 * 判断节点是否为独立选区节点
 * @param node
 */
export const isSelectionElement = (node: Node | null): boolean => {
  if (!node) return false;
  const el = isDOMElement(node) ? node : node.parentElement;
  if (isDOMElement(el) && el.hasAttribute(X_SELECTION_KEY)) return true;
  return false;
};

/**
 * 将 ModalPoint 转换为 DOMPoint
 * @param editor
 * @param point
 * @param context
 */
export const toDOMPoint = (
  editor: BlockEditor,
  point: RangePoint,
  context: NormalizePointContext
): DOMPoint => {
  const def: DOMPoint = { node: null, offset: 0 };
  if (point.type === POINT_TYPE.BLOCK) {
    const state = editor.state.getBlock(point.id);
    // 如果是空节点, 例如图片、视频等
    if (state && isVoidBlockType(state)) {
      const zero = editor.model.getZeroNode(state);
      return { node: zero, offset: 0 };
    }
    // 从块节点上查找文本编辑器的文本节点
    const domPoint = context.isEndNode
      ? getBlockEndTextNode(editor, point.id)
      : getBlockStartTextNode(editor, point.id);
    return domPoint || def;
  }
  if (point.type === POINT_TYPE.TEXT) {
    const blockState = editor.state.getBlock(point.id);
    const text = blockState && editor.model.getTextEditor(blockState);
    const textPoint = text && TextPoint.fromRaw(text, new RawPoint(point.offset));
    const domPoint = text && textPoint && toTextDOMPoint(text, textPoint);
    return domPoint || def;
  }
  return def;
};

/**
 * 将 ModalRange 转换为 DOMRange
 * @param editor
 * @param range
 */
export const toDOMRange = (editor: BlockEditor, range: Range): DOMRange | null => {
  const start = range.nodes[0];
  const end = range.nodes[range.nodes.length - 1];
  const isCollapsed = range.isCollapsed;
  if (!start || !end) {
    return null;
  }
  if (Entry.isBlock(start) && Entry.isBlock(end)) {
    const node = editor.selection.element || editor.getContainer();
    const domRange = window.document.createRange();
    domRange.setStart(node, 0);
    domRange.setEnd(node, 0);
    return domRange;
  }
  const { BLOCK, TEXT } = POINT_TYPE;
  const startPoint: RangePoint = Entry.isBlock(start)
    ? Point.create(start.id, BLOCK)
    : Point.create(start.id, TEXT, start.start);
  let endPoint: RangePoint | null = isCollapsed ? startPoint : null;
  // 选区为同 Entry 的非折叠状态
  if (!isCollapsed && start.id === end.id) {
    endPoint = Entry.isBlock(start)
      ? Point.create(start.id, BLOCK)
      : Point.create(start.id, TEXT, start.start + start.len);
  }
  // 选区为多个 Entry 的情况
  if (start.id !== end.id) {
    endPoint = Entry.isBlock(end)
      ? Point.create(end.id, BLOCK)
      : Point.create(end.id, TEXT, end.start + end.len);
  }
  if (!startPoint || !endPoint) {
    return null;
  }
  const startDOMPoint = toDOMPoint(editor, startPoint, { isCollapsed, isEndNode: false });
  const endDOMPoint = isCollapsed
    ? startDOMPoint
    : toDOMPoint(editor, endPoint, { isCollapsed, isEndNode: true });
  if (!startDOMPoint.node || !endDOMPoint.node) {
    return null;
  }
  const domRange = window.document.createRange();
  const { node: startNode, offset: startOffset } = startDOMPoint;
  const { node: endNode, offset: endOffset } = endDOMPoint;
  const startTextNode = getTextNode(startNode);
  const endTextNode = getTextNode(endNode);
  if (startTextNode && endTextNode) {
    domRange.setStart(startTextNode, Math.min(startOffset, startTextNode.length));
    domRange.setEnd(endTextNode, Math.min(endOffset, endTextNode.length));
    return domRange;
  }
  return null;
};
