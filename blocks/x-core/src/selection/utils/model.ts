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
import type { BlockState } from "../../state/modules/block-state";
import { getLCAWithChildren } from "../../state/utils/tree";
import { Entry } from "../modules/entry";
import { Point } from "../modules/point";
import { Range } from "../modules/range";
import type { RangeEntry, RangePoint } from "../types";
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
  const { TEXT, BLOCK } = POINT_TYPE;
  // ============== 同节点情况 ==============
  // 如果 id 相同, 则为相同的块节点
  if (start.id === end.id) {
    return start.type === BLOCK || end.type === BLOCK
      ? [Entry.create(start.id, BLOCK)]
      : [Entry.fromPoint(start, start.offset, end.offset - start.offset)];
  }
  // ============== 不同节点情况 ==============
  // 如果端点存在 Block 类型, 则处理为同级块节点集合
  const result = getLCAWithChildren(startState, endState);
  if (!result) return [];
  const { lca, child1, child2 } = result;
  if (start.type === BLOCK || end.type === BLOCK) {
    return lca.children.slice(child1.index, child2.index + 1).map(it => Entry.create(it.id, BLOCK));
  }
  // 文本节点下, 无论端点深度是否相同, 都处理为 DFS 序
  const startEntry = Entry.fromPoint(start, start.offset, startState.length - start.offset);
  const endEntry = Entry.fromPoint(end, 0, end.offset);
  const nodes = lca.getTreeNodes();
  const between: RangeEntry[] = [];
  let isInsideNode = false;
  let maxAccessLevel = Infinity;
  NODES_ITERATOR: for (const node of nodes) {
    // 遇到起始节点, 则开始记录
    if (node.id === start.id) {
      isInsideNode = true;
      // 向父节点迭代查找块级类型的节点
      let current: BlockState | null = node.parent;
      let diff = node.depth - child1.depth;
      while (diff-- > 0 && current) {
        if (current.isBlockNode()) {
          maxAccessLevel = current.depth;
          between.push(Entry.create(child1.id, BLOCK));
          continue NODES_ITERATOR;
        }
        current = current.parent;
      }
      between.push(startEntry);
      continue;
    }
    // 如果小于等于最大访问深度, 则认为已经越过先前的块节点, 恢复最大访问深度
    if (isInsideNode && maxAccessLevel !== Infinity && node.depth <= maxAccessLevel) {
      maxAccessLevel = Infinity;
    }
    // 遇到结束节点, 则停止记录
    if (node.id === end.id) {
      // 如果结束节点深度小于最大访问深度, 则需要将结束节点加入结果中
      endState.depth < maxAccessLevel && between.push(endEntry);
      break;
    }
    // 如果不在起始节点和结束节点之间, 或者超过最大访问深度, 则跳过
    if (!isInsideNode || node.depth > maxAccessLevel) {
      continue;
    }
    // 分别处理块节点和文本节点
    if (node.isBlockNode()) {
      maxAccessLevel = node.depth;
      between.push(Entry.create(node.id, BLOCK));
    } else {
      between.push(Entry.create(node.id, TEXT, 0, node.length));
    }
  }
  return between;
};
