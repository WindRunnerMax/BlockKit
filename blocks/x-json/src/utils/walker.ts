import type { Blocks } from "../types/block";

export type BlockTreeWalker<T extends Blocks> = {
  nextNode: () => T[string] | null;
  [Symbol.iterator]: () => Generator<T[string]>;
};

/**
 * 创建 Block 树遍历器 [DFS]
 * - 返回的节点数据会包含 root 起始节点
 * @param blocks Block 数据集合
 * @param rootId 根节点 ID
 */
export const createBlockTreeWalker = <T extends Blocks>(
  blocks: T,
  rootId: string
): BlockTreeWalker<T> => {
  type BlockLike = T[string];
  const visited = new Set<string>();
  const stack: string[] = [rootId];
  function* traverse(): Generator<BlockLike> {
    while (stack.length > 0) {
      const nodeId = stack.pop();
      if (!nodeId || visited.has(nodeId) || !blocks[nodeId]) {
        continue;
      }
      const node = blocks[nodeId];
      visited.add(nodeId);
      yield node as BlockLike;
      const children = node.data.children || [];
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }
  }
  const walker = traverse();
  return {
    nextNode: (): BlockLike | null => walker.next().value || null,
    [Symbol.iterator]: () => walker[Symbol.iterator](),
  };
};

/**
 * 创建 Block 树遍历器 [BFS]
 * - 返回的节点数据会包含 root 起始节点
 * @param blocks Block 数据集合
 * @param rootId 根节点 ID
 */
export const createBlockTreeWalkerBFS = <T extends Blocks>(
  blocks: T,
  rootId: string
): BlockTreeWalker<T> => {
  type BlockLike = T[string];
  const visited = new Set<string>();
  const queue: string[] = [rootId];
  function* traverse(): Generator<BlockLike> {
    while (queue.length > 0) {
      const nodeId = queue.shift();
      const node = nodeId && blocks[nodeId];
      if (!nodeId || !node || visited.has(nodeId)) {
        continue;
      }
      visited.add(nodeId);
      yield node as BlockLike;
      const children = node.data.children || [];
      for (const childId of children) {
        queue.push(childId);
      }
    }
  }
  const walker = traverse();
  return {
    nextNode: (): BlockLike | null => walker.next().value || null,
    [Symbol.iterator]: () => walker[Symbol.iterator](),
  };
};
