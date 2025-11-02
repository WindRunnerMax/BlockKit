import { isDOMElement } from "@block-kit/utils";

import { X_SELECTION_KEY } from "../../model/types";

/**
 * 判断节点是否为独立选区节点
 * @param node
 */
export const isSelectionElement = (node: Node | null): boolean => {
  if (!node) return false;
  const el = isDOMElement(node) ? node : node.parentElement;
  if (isDOMElement(el) && el.hasAttribute(X_SELECTION_KEY)) return true;
  return false;
};
