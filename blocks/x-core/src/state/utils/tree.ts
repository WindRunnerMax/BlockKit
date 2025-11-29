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
 * - 注意 n1 和 n2 可能为同子树, 该情况下返回元组值相同, 直接比较节点深度即可
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
  type LCATuple = { lca: BlockState; child1: BlockState; child2: BlockState };
  if (current1 === current2) {
    return { lca: current1, child1: current1, child2: current1 } as LCATuple;
  }
  while (current1 && current2 && current1 !== current2) {
    const parent1 = current1.parent;
    const parent2 = current2.parent;
    if (parent1 && parent1 === parent2) {
      return { lca: parent1, child1: current1, child2: current2 } as LCATuple;
    }
    current1 = parent1;
    current2 = parent2;
  }
  return null;
};

/**
 * 获取相邻的上一个节点
 * - 与 prev 方法不同的是, 该方法会跨越父节点查找上一个节点
 * @param state 块状态
 * @param strict [?=false] 严格查找文本节点
 */
export const getPrevSiblingNode = (state: BlockState, strict = false): BlockState | null => {
  // 获取上一个相邻节点时, 需要分情况讨论, 以下面的树结构为例:
  //         A
  //      /  |  \
  //     B   D   G
  //    /   / \
  //   C   E   F
  // - F 节点的上一个节点为 E 节点, 为其相邻的同级节点
  // - E 节点的上一个节点为 D 节点, 为其父节点
  // - D 节点的上一个节点为 C 节点, 为其同级节点 B 的最深文本节点
  const prev = state.prev();
  if (prev) {
    if (!strict) return prev;
    // 严格查找文本节点
    const nodes = prev.getTreeNodes();
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (!node.isBlockType()) return node;
    }
  }
  let current = state;
  // 没有上一个节点且不严格查找则直接返回其父节点
  if (!strict && current.parent) {
    return current.parent;
  }
  // 否则没有前节点的情况, 从其父节点上查找文本节点
  while (current && current.parent) {
    const parent = current.parent;
    // 文本节点则可以停止查找, 可以直接返回
    if (!parent.isBlockType()) {
      return parent;
    }
    current = current.parent;
  }
  return null;
};

/**
 * 获取紧邻的下一个节点
 * - 与 next 方法不同的是, 该方法会跨越父节点查找下一个节点
 * @param state 块状态
 * @param strict [?=false] 严格查找文本节点
 */
export const getNextSiblingNode = (state: BlockState, strict = false): BlockState | null => {
  // 获取下一个相邻节点时, 同样需要分情况讨论, 以下面的树结构为例:
  //         A
  //      /  |  \
  //     B   D   G
  //    /   / \
  //   C   E   F
  // - F 节点的下一个节点为 G 节点, 为其父节点的同级节点
  // - E 节点的下一个节点为 F 节点, 为其同级节点
  // - D 节点的下一个节点为 E 节点, 为其直属的首个子节点
  // 非严格模式下检查子节点和同级节点
  if (!strict) {
    // 优先检查直属的子节点
    const firstChild = state.children[0];
    if (firstChild) return firstChild;
    // 其次检查同级的下一个节点
    const nextNode = state.next();
    if (nextNode) return nextNode;
  }
  // 严格模式下需要控制查找文本节点
  const parent = state.parent;
  if (!parent) return null;
  const nodes = parent.getTreeNodes();
  let isStarted = false;
  for (const node of nodes) {
    // 遇到 state 之后才正常进行查找
    if (node === state) {
      isStarted = true;
      continue;
    }
    // 到这里为严格模式, 在开始查找之后直接返回文本节点
    if (isStarted && !node.isBlockType()) {
      return node;
    }
  }
  return null;
};
