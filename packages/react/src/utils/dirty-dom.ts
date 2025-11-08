import type { Editor, LeafState } from "@block-kit/core";
import { VOID_KEY, ZERO_SYMBOL } from "@block-kit/core";
import { isDOMText, isHTMLElement } from "@block-kit/utils";

import { LEAF_TO_REMOUNT, LEAF_TO_TEXT, LEAF_TO_ZERO_TEXT } from "./weak-map";

/**
 * 纯文本节点的检查更新
 * @param leaf Leaf 状态
 */
export const updateDirtyText = (leaf: LeafState) => {
  const zeroNode = LEAF_TO_ZERO_TEXT.get(leaf);
  const isZeroNode = !!zeroNode;
  const textNode = isZeroNode ? zeroNode : LEAF_TO_TEXT.get(leaf);
  if (!textNode) return false;
  const text = isZeroNode ? ZERO_SYMBOL : leaf.getText();
  const nodes = textNode.childNodes;
  // 文本节点内部仅应该存在一个文本节点, 需要移除额外节点
  for (let i = 1; i < nodes.length; ++i) {
    const node = nodes[i];
    node && node.remove();
  }
  // 如果文本内容不合法, 通常是由于输入的脏 DOM, 需要纠正内容
  if (isDOMText(textNode.firstChild)) {
    // Case1: [inline-code][caret][text] IME 会导致模型/文本差异
    // Case3: 在单行仅存在 Embed 节点时, 在节点最前输入会导致内容重复
    if (textNode.firstChild.nodeValue === text) return false;
    textNode.firstChild.nodeValue = text;
    if (process.env.NODE_ENV === "development") {
      console.log("Correct Text Node", textNode);
    }
  } else {
    // Case2: Safari 下在 a 节点末尾输入时, 会导致节点内外层交换
    const func = LEAF_TO_REMOUNT.get(leaf);
    func && func();
    if (process.env.NODE_ENV === "development") {
      console.log("Force Render Text Node", textNode);
    }
  }
  return true;
};

/**
 * Leaf 节点的检查更新
 * @param editor
 * @param leaf
 */
export const updateDirtyLeaf = (editor: Editor, leaf: LeafState) => {
  const dom = editor.model.getLeafNode(leaf);
  const nodes = dom && dom.childNodes;
  if (!nodes || nodes.length <= 1) return false;
  // data-leaf 节点内部仅应该存在非文本节点, 文本类型单节点, 嵌入类型双节点
  for (let i = 1; i < nodes.length; ++i) {
    const node = nodes[i];
    // 双节点情况下, 即 Void/Embed 节点类型时需要忽略该节点
    if (isHTMLElement(node) && node.hasAttribute(VOID_KEY)) {
      continue;
    }
    // Case1: Chrome a 标签内的 IME 输入会导致同级的额外文本节点类型插入
    // Case2: Firefox a 标签内的 IME 输入会导致同级的额外 data-string 节点类型插入
    node.remove();
    if (process.env.NODE_ENV === "development") {
      console.log("Remove Leaf Child", dom);
    }
  }
  return true;
};

/**
 * 重写 removeChild 方法
 * - 避免 IME 破坏跨节点渲染造成问题
 * - https://github.com/facebookarchive/draft-js/issues/1320
 */
export const rewriteRemoveChild = (node: Node) => {
  const removeChild = Node.prototype.removeChild;
  node.removeChild = function <T extends Node>(child: T) {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
};
