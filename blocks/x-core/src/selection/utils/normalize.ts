import type { BlockEditor } from "../../editor";
import { isBoxLikeBlockType, isTextBlockType } from "../../schema/utils/is";
import type { BlockState } from "../../state/modules/state";
import { getLCAWithChildren } from "../../state/utils/tree";
import { Entry } from "../modules/entry";
import { Point } from "../modules/point";
import type { RangeEntry, RangePoint } from "../types";
import { POINT_TYPE } from "./constant";

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
  const lcaResult = getLCAWithChildren(startState, endState);
  if (!lcaResult) return [];
  const { lca, child1, child2 } = lcaResult;
  // 全部为块节点的情况下, 返回所有中间块节点
  if (start.type === BLOCK && end.type === BLOCK) {
    return lca.children.slice(child1.index, child2.index + 1).map(it => Entry.create(it.id, BLOCK));
  }
  // 文本节点下, 无论端点深度是否相同, 都处理为 DFS 序
  const startEntry = Point.isBlock(start)
    ? Entry.create(start.id, BLOCK)
    : Entry.fromPoint(start, start.offset, startState.length - start.offset);
  const endEntry = Point.isBlock(end)
    ? Entry.create(end.id, BLOCK)
    : Entry.fromPoint(end, 0, end.offset);
  const nodes = lca.getTreeNodes();
  const stack: BlockState[] = [];
  const result: RangeEntry[] = [];
  let startTracking = false;
  let exitingTracking = false;
  for (let k = 0, n = nodes.length; k < n; k++) {
    const node = nodes[k];
    // 在 k 为 0 的情况下, node 实际上即为 lca 节点
    // 如果首节点为非文本节点, 且不是 lca 的直属子节点, 该情况下不参与迭代
    if (k === 0 && !isTextBlockType(node) && lca !== child1 && lca !== child2) {
      continue;
    }
    // 如果节点深度小于最后块节点的深度, 则出栈
    // 此外栈节点的深度可能会突变, 则需要持续出栈, 直到深度匹配
    for (let i = stack.length - 1; i >= 0; i--) {
      const lastStackNode = stack[i];
      if (lastStackNode && node.depth <= lastStackNode.depth) {
        stack.pop();
        continue;
      }
      break;
    }
    // 遇到块类型的节点, 则入栈, 先出栈再入栈以避免刚入栈就出栈
    if (isBoxLikeBlockType(node)) {
      stack.push(node);
    }
    const isInBlockStack = stack.length > 0;
    // 遇到起始节点, 则开始记录
    START: if (node.id === start.id) {
      startTracking = true;
      // 当前在块节点中, 则会走到后续的统一节点处理逻辑
      if (isInBlockStack) break START;
      // 如果当前不在块节点内, 则直接添加起始节点到结果中
      result.push(startEntry);
      continue;
    }
    // 遇到结束节点, 则停止记录
    END: if (node.id === end.id) {
      exitingTracking = true;
      // 当前在块节点中, 则会走到后续的统一节点处理逻辑
      if (isInBlockStack) break END;
      // 如果当前不在块节点内, 则直接添加末尾节点到结果中
      result.push(endEntry);
      break;
    }
    if (!startTracking) continue;
    // 如果栈中存在内容, 则当前处于块节点内, 检查是否已经置于结果中
    const firstStackNode = stack[0];
    const lastResultNode = result[result.length - 1];
    if (isInBlockStack) {
      // 如果当前未置于结果中, 则添加到结果中
      if (!lastResultNode || firstStackNode.id !== lastResultNode.id) {
        result.push(Entry.create(firstStackNode.id, BLOCK));
      }
    } else {
      // 否则, 则添加当前节点到结果中
      result.push(Entry.create(node.id, TEXT, 0, node.length));
    }
    // 退出过程结束, 避免上述统一处理后不结束迭代
    if (exitingTracking) break;
  }
  return result;
};
