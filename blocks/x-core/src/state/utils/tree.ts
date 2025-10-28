import type { BlockState } from "../modules/block-state";

/**
 * 获取指定深度的祖先节点
 * @param blockState
 * @param depth
 */
export const getAncestorAtDepth = (blockState: BlockState, depth: number): BlockState | null => {
  if (depth < 0) return null;
  let current: BlockState | null = blockState;
  while (current && current.depth > depth) {
    current = current.parent;
  }
  return current && current.depth === depth ? current : null;
};

/**
 * 清空树节点缓存
 * - 从指定节点开始向上清空所有父节点的缓存
 * @param blockState
 */
export const clearTreeCache = (blockState: BlockState) => {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let parent: BlockState | null = blockState;
  while (parent) {
    parent._nodes = null;
    parent = parent.parent;
  }
};
