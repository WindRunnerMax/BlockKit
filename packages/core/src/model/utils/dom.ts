import { BLOCK_KEY, LEAF_KEY, NODE_KEY } from "../types";

/**
 * 获取最近的叶子节点
 * @param node
 */
export const getLeafNode = (node: Node | null): HTMLElement | null => {
  if (!node) {
    return null;
  }
  if (node instanceof HTMLElement) {
    return node.closest(`[${LEAF_KEY}]`);
  }
  if (node.parentElement instanceof HTMLElement) {
    return node.parentElement.closest(`[${LEAF_KEY}]`);
  }
  return null;
};

/**
 * 获取最近的行节点
 * @param node
 */
export const getLineNode = (node: Node | null): HTMLElement | null => {
  const element = getLeafNode(node);
  if (!element) {
    return null;
  }
  return element.closest(`[${NODE_KEY}]`);
};

/**
 * 获取最近的块节点
 * @param node
 */
export const getBlockNode = (node: Node | null): HTMLElement | null => {
  if (!node) {
    return null;
  }
  if (node instanceof HTMLElement) {
    return node.closest(`[${BLOCK_KEY}]`);
  }
  if (node.parentElement instanceof HTMLElement) {
    return node.parentElement.closest(`[${BLOCK_KEY}]`);
  }
  return null;
};

/**
 * 获取接近的节点
 * @param node
 * @param selector
 */
export const closestTo = <T extends Element>(node: Node | null, selector: string): T | null => {
  if (!node) {
    return null;
  }
  if (node instanceof HTMLElement) {
    return node.closest(selector);
  }
  if (node.parentElement instanceof HTMLElement) {
    return node.parentElement.closest(selector);
  }
  return null;
};

/**
 * 判断接近选择器节点
 * @param node
 * @param selector
 */
export const isClosestTo = (node: Node | null, selector: string): boolean => {
  return !!closestTo(node, selector);
};
