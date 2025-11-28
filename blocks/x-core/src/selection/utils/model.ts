import type { DOMPoint, NormalizePointContext } from "@block-kit/core";
import {
  closestTo,
  isClosestTo,
  normalizeDOMPoint,
  toModelPoint as toTextModelPoint,
} from "@block-kit/core";
import { RawPoint } from "@block-kit/core";

import type { BlockEditor } from "../../editor";
import { X_BLOCK_ID_KEY, X_TEXT_BLOCK_KEY } from "../../model/types";
import { Point } from "../modules/point";
import { Range } from "../modules/range";
import type { RangePoint } from "../types";
import { POINT_TYPE } from "./constant";
import { normalizeModelRange } from "./normalize";

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
  const isTextBlock = isClosestTo(node, `[${X_TEXT_BLOCK_KEY}]`);
  const xBlockNode = closestTo(node, `[${X_BLOCK_ID_KEY}]`);
  if (!xBlockNode || !node) return null;
  const { TEXT, BLOCK } = POINT_TYPE;
  const id = xBlockNode.getAttribute(X_BLOCK_ID_KEY)!;
  const blockState = isTextBlock && editor.state.getBlock(id);
  const text = blockState && editor.model.getTextEditor(blockState);
  // 如果是文本类型的块节点
  if (isTextBlock && text) {
    const startDOMPoint = normalizeDOMPoint(domPoint, context);
    const pointContext = { ...context, nodeContainer: node, nodeOffset: offset };
    const startRangePoint = toTextModelPoint(text, startDOMPoint, pointContext);
    const raw = RawPoint.fromPoint(text, startRangePoint);
    if (raw) return Point.create(id, TEXT, raw.offset);
  }
  // 否则作为块节点处理
  return Point.create(id, BLOCK);
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
