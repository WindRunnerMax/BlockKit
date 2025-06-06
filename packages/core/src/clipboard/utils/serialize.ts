import { EOL } from "@block-kit/delta";

import { NODE_KEY } from "../../model/types";

/**
 * 序列化 HTML 到 文本
 * @param node
 * @param clone
 */
export const serializeHTML = (node: Node, clone = false): string => {
  const el = document.createElement("div");
  el.appendChild(clone ? node.cloneNode(true) : node);
  return el.innerHTML;
};

/**
 * 递归处理节点文本内容
 * @param node
 */
export const getTextContent = (node: Node): string => {
  if (node instanceof Text) {
    return node.textContent || "";
  }
  const texts: string[] = [];
  node.childNodes.forEach(child => {
    texts.push(getTextContent(child));
  });
  if (node instanceof Element && node.getAttribute(NODE_KEY)) {
    texts.push(EOL);
  }
  return texts.join("");
};

/**
 * 获取节点的文本内容
 * @param node
 */
export const getFragmentText = (node: Node) => {
  const texts: string[] = [];
  Array.from(node.childNodes).forEach(it => {
    texts.push(getTextContent(it));
  });
  const res = texts.join("");
  // 将文本最后的 \n 移除
  return res.endsWith(EOL) ? res.slice(0, -1) : res;
};
