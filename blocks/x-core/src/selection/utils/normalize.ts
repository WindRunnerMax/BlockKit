import type { BlockEditor } from "../../editor";
import type { BlockState } from "../../state/modules/state";
import { getLCAWithChildren } from "../../state/utils/tree";
import { Entry } from "../modules/entry";
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
  if (start.type === BLOCK || end.type === BLOCK) {
    return lca.children.slice(child1.index, child2.index + 1).map(it => Entry.create(it.id, BLOCK));
  }
  // 文本节点下, 无论端点深度是否相同, 都处理为 DFS 序
  const startEntry = Entry.fromPoint(start, start.offset, startState.length - start.offset);
  const endEntry = Entry.fromPoint(end, 0, end.offset);
  const nodes = lca.getTreeNodes();
  const stack: BlockState[] = [];
  const result: RangeEntry[] = [];
  let startTracking = false;
  for (let k = 0, n = nodes.length; k < n; k++) {
    const node = nodes[k];
    // 如果是首节点块节点, 则不参与迭代, 目前仅容器类型需要跳过
    if (k === 0 && node.isBlockType()) continue;
    // 如果节点深度小于最后块节点的深度, 则出栈
    // 此外栈节点的深度可能会突变, 则需要持续出栈, 直到深度匹配
    for (let i = stack.length - 1; i >= 0; i--) {
      const lastStackNode = stack[i];
      if (lastStackNode && node.depth <= lastStackNode.depth) {
        stack.pop();
      }
    }
    // 遇到块类型的节点, 则入栈, 先出栈再入栈以避免刚入栈就出栈
    if (node.isBlockType()) {
      stack.push(node);
    }
    const isInBlockStack = stack.length > 0;
    // 遇到起始节点, 则开始记录
    if (node.id === start.id) {
      startTracking = true;
      // 如果当前不在块节点内, 则直接添加起始节点到结果中
      // 并且继续遍历下一个节点, 否则会走到后续的统一节点处理逻辑
      if (!isInBlockStack) {
        result.push(startEntry);
        continue;
      }
    }
    // 遇到结束节点, 则停止记录
    if (node.id === end.id) {
      !isInBlockStack && result.push(endEntry);
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
      // 否则, 则添加当前节点到结果中, 需要分别处理块节点和文本节点
      if (node.isBlockType()) {
        result.push(Entry.create(node.id, BLOCK));
      } else {
        result.push(Entry.create(node.id, TEXT, 0, node.length));
      }
    }
  }
  return result;
};
