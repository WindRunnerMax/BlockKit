import type { DOMPoint } from "@block-kit/core";
import { toDOMPoint as toTextDOMPoint } from "@block-kit/core";
import { Point } from "@block-kit/core";
import { isDOMElement } from "@block-kit/utils";

import type { BlockEditor } from "../../editor";
import { X_ZERO_KEY } from "../types/index";

/**
 * 获取指定 Block 的起始位置的 Text 节点
 * @param editor
 * @param blockId
 */
export const getBlockStartTextNode = (editor: BlockEditor, blockId: string): DOMPoint | null => {
  const block = editor.state.getBlock(blockId);
  if (!block) return null;
  const nodes = block.getTreeNodes();
  for (const node of nodes) {
    if (node.isBlockType()) continue;
    const text = editor.model.getTextEditor(node);
    const textPoint: Point = Point.from(0, 0);
    const textDOM = text && toTextDOMPoint(text, textPoint);
    return textDOM;
  }
  return null;
};

/**
 * 获取指定 Block 的末尾位置的 Text 节点
 * @param editor
 * @param blockId
 */
export const getBlockEndTextNode = (editor: BlockEditor, blockId: string): DOMPoint | null => {
  const block = editor.state.getBlock(blockId);
  if (!block) return null;
  const nodes = block.getTreeNodes();
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (!node || node.isBlockType()) continue;
    const text = editor.model.getTextEditor(node);
    const textBlock = text && text.state.block;
    const lines = textBlock && textBlock.getLines();
    const lastLine = lines && lines[lines.length - 1];
    const textPoint = lastLine && Point.from(lines.length - 1, lastLine.length - 1);
    const textDOM = text && textPoint && toTextDOMPoint(text, textPoint);
    return textDOM;
  }
  return null;
};

/**
 * 获取指定 Block 的起始位置的零宽文本 Text 节点
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
 * 获取指定 Block 的末尾位置的零宽文本 Text 节点
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
