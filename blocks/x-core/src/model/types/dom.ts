import { isDOMElement } from "@block-kit/utils";

import type { BlockEditor } from "../../editor";
import { X_ZERO_KEY } from ".";

/**
 * 获取指定 Block 的起始位置的 Text 节点
 * @param editor
 * @param blockId
 */
export const getBlockStartZeroNode = (editor: BlockEditor, blockId: string): Text | null => {
  const block = editor.state.getBlock(blockId);
  const blockNode = block && block.getDOMNode();
  const firstNode = blockNode && blockNode.firstElementChild;
  if (isDOMElement(firstNode) && firstNode.hasAttribute(X_ZERO_KEY)) {
    return firstNode.firstChild as Text;
  }
  return null;
};

/**
 * 获取指定 Block 的末尾位置的 Text 节点
 * @param editor
 * @param blockId
 */
export const getBlockEndZeroNode = (editor: BlockEditor, blockId: string): Text | null => {
  const block = editor.state.getBlock(blockId);
  const blockNode = block && block.getDOMNode();
  const lastNode = blockNode && blockNode.lastElementChild;
  if (isDOMElement(lastNode) && lastNode.hasAttribute(X_ZERO_KEY)) {
    return lastNode.firstChild as Text;
  }
  return null;
};
