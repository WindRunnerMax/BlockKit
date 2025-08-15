import { LEAF_KEY, NODE_KEY } from "../types";

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

export const getLineNode = (node: Node | null): HTMLElement | null => {
  const element = getLeafNode(node);
  if (!element) {
    return null;
  }
  return element.closest(`[${NODE_KEY}]`);
};

export const isClosestTo = (node: Node | null, selector: string): boolean => {
  if (!node) {
    return false;
  }
  if (node instanceof HTMLElement) {
    return node.closest(selector) !== null;
  }
  if (node.parentElement instanceof HTMLElement) {
    return node.parentElement.closest(selector) !== null;
  }
  return false;
};
