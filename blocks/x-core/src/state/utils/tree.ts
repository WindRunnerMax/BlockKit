import type { BlockState } from "../modules/block-state";

/**
 * 获取指定深度级的祖先节点
 * @param blockState
 * @param steps
 */
export const getAncestorBySteps = (blockState: BlockState, steps: number): BlockState | null => {
  let current: BlockState | null = blockState;
  while (steps-- > 0 && current) {
    current = current.parent;
  }
  return current;
};

/**
 * 获取两个节点的公共祖先节点 LCA
 * @param n1
 * @param n2
 */
export const getLowestCommonAncestor = (n1: BlockState, n2: BlockState): BlockState | null => {
  let depth1 = n1.depth;
  let depth2 = n2.depth;
  let current1: BlockState | null = n1;
  let current2: BlockState | null = n2;
  while (depth1 > depth2 && current1) {
    current1 = current1.parent;
    depth1--;
  }
  while (depth2 > depth1 && current2) {
    current2 = current2.parent;
    depth2--;
  }
  while (current1 && current2 && current1 !== current2) {
    current1 = current1.parent;
    current2 = current2.parent;
  }
  return current1 === current2 ? current1 : null;
};

/**
 * 清空树节点缓存
 * - 从指定节点开始向上清空所有父节点的缓存
 * @param blockState
 */
export const clearTreeCache = (blockState: BlockState) => {
  const visited = new Set<BlockState>();
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let current: BlockState | null = blockState;
  while (current) {
    if (visited.has(current)) {
      break;
    }
    visited.add(current);
    current._nodes = null;
    current = current.parent;
  }
};

/**
 * 获取两个节点的公共祖先节点 LCA 及直属节点
 * @param n1
 * @param n2
 */
export const getLCAWithChildren = (n1: BlockState, n2: BlockState) => {
  let depth1 = n1.depth;
  let depth2 = n2.depth;
  let current1: BlockState | null = n1;
  let current2: BlockState | null = n2;
  while (depth1 > depth2 && current1) {
    current1 = current1.parent;
    depth1--;
  }
  while (depth2 > depth1 && current2) {
    current2 = current2.parent;
    depth2--;
  }
  while (current1 && current2 && current1 !== current2) {
    const parent1 = current1.parent;
    const parent2 = current2.parent;
    if (parent1 && parent1 === parent2) {
      type LCATuple = { lca: BlockState; child1: BlockState; child2: BlockState };
      return { lca: parent1, child1: current1, child2: current2 } as LCATuple;
    }
    current1 = parent1;
    current2 = parent2;
  }
  return null;
};
