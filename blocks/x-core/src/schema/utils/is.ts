import type { BlockState } from "../../state/modules/state";
import type { XSchemaRule } from "../types";

export type Rule = XSchemaRule | undefined;

/**
 * 容器节点
 * - 例如 Quote、Cols、Table 块类型
 * @param block
 */
export const isBoxBlockType = (block: BlockState): boolean => {
  const editor = block.container.editor;
  const rule: Rule = editor.schema.schema[block.type];
  return !rule ? !block.data.delta : !!rule.box;
};

/**
 * 文本节点
 * - 例如 Text、Bullet、Ordered 块类型
 * @param block
 */
export const isTextBlockType = (block: BlockState): boolean => {
  const editor = block.container.editor;
  const rule: Rule = editor.schema.schema[block.type];
  return !rule ? !!block.data.delta : !!rule.text;
};

/**
 * 类容器节点
 * - 例如 Quote、Table、Code 块类型
 */
export const isBoxLikeBlockType = (block: BlockState): boolean => {
  const editor = block.container.editor;
  const rule: Rule = editor.schema.schema[block.type];
  return !rule ? !block.data.delta : !!rule.box || !!rule.box_text;
};

/**
 * 类文本节点
 * - 例如 Text、Code 块类型
 * @param block
 */
export const isTextLikeBlockType = (block: BlockState): boolean => {
  const editor = block.container.editor;
  const rule: Rule = editor.schema.schema[block.type];
  return !rule ? !!block.data.delta : !!rule.text || !!rule.box_text;
};

/**
 * 空节点
 * - 例如 Image 块类型
 * @param block
 */
export const isVoidBlockType = (block: BlockState): boolean => {
  const editor = block.container.editor;
  const rule: Rule = editor.schema.schema[block.type];
  return rule ? !!rule.void : false;
};
