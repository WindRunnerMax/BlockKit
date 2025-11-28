import type { Editor } from "@block-kit/core";
import type { LeafState } from "@block-kit/core";
import { LEAF_KEY, LEAF_STRING, ZERO_SPACE_KEY } from "@block-kit/core";
import { isDOMElement, isDOMText, preventNativeEvent } from "@block-kit/utils";

import { DATA_EDITABLE_KEY, VARS_KEY } from "./constant";

export const onLeftArrowKey = (sel: Selection, e: KeyboardEvent) => {
  let leafNode: Element | null;
  if (
    sel.anchorOffset === 0 &&
    sel.anchorNode &&
    sel.anchorNode.parentElement &&
    (leafNode = sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`))
  ) {
    const prevNode = leafNode.previousSibling;
    if (!isDOMElement(prevNode) || !prevNode.hasAttribute(LEAF_KEY)) {
      return void 0;
    }
    const selector = `span[${LEAF_STRING}], span[${ZERO_SPACE_KEY}]`;
    const focusNode = prevNode.querySelector(selector);
    if (!focusNode || !isDOMText(focusNode.firstChild)) {
      return void 0;
    }
    const text = focusNode.firstChild;
    sel.setBaseAndExtent(text, text.length, text, text.length);
    preventNativeEvent(e);
  }
};

export const onRightArrowKey = (value: string, sel: Selection, e: KeyboardEvent) => {
  let leafNode: Element | null;
  if (
    sel.anchorOffset === value.length &&
    sel.anchorNode &&
    sel.anchorNode.parentElement &&
    (leafNode = sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`))
  ) {
    const prevNode = leafNode.nextSibling;
    if (!isDOMElement(prevNode) || !prevNode.hasAttribute(LEAF_KEY)) {
      return void 0;
    }
    const selector = `span[${LEAF_STRING}], span[${ZERO_SPACE_KEY}]`;
    const focusNode = prevNode.querySelector(selector);
    if (!focusNode || !isDOMText(focusNode.firstChild)) {
      return void 0;
    }
    const text = focusNode.firstChild;
    sel.setBaseAndExtent(text, 0, text, 0);
    preventNativeEvent(e);
  }
};

export const onTabKey = (editor: Editor, sel: Selection, e: KeyboardEvent) => {
  preventNativeEvent(e);
  let leaf: LeafState | null;
  let leafNode: Element | null;
  if (
    sel.anchorNode &&
    sel.anchorNode.parentElement &&
    (leafNode = sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`)) &&
    (leaf = editor.model.getLeafState(leafNode as HTMLElement))
  ) {
    leaf = leaf.next(true);
    // 第一次遍历是从当前叶子节点遍历到末尾
    while (leaf) {
      const attributes = leaf.op.attributes;
      if (leaf.embed && attributes && attributes[VARS_KEY]) {
        break;
      }
      leaf = leaf.next(true);
    }
    // 第二次遍历则是在 leaf 节点没有找到的情况下从头遍历
    if (!leaf) {
      const line = editor.state.block.getLine(0);
      leaf = line && line.getFirstLeaf();
      while (leaf) {
        const attributes = leaf.op.attributes;
        if (leaf.embed && attributes && attributes[VARS_KEY]) {
          break;
        }
        leaf = leaf.next(true);
      }
    }
    // 如果查找到目标 leaf, 设置选区
    const n = editor.model.getLeafNode(leaf);
    if (leaf && n) {
      const node = n && n.querySelector(`[${DATA_EDITABLE_KEY}]`);
      if (!node) return void 0;
      const targetNode = isDOMText(node.firstChild) ? node.firstChild : node;
      sel.setBaseAndExtent(targetNode, 0, targetNode, 0);
    }
  }
};
