import type { AttributeMap } from "@block-kit/delta";
import { isEOLOp } from "@block-kit/delta";

import type { BlockEditor } from "../../editor";
import type { OpMeta } from "../types";

/**
 * 过滤需要追踪的属性
 * - mark: 输入时会自动追踪样式的节点
 * - mark + inline: 不追踪末尾 Mark
 * @param editor 编辑器实例
 * @param meta Op 元信息
 */
export const getOpMetaMarks = (editor: BlockEditor, meta: OpMeta): AttributeMap | undefined => {
  const { op, tail, ops } = meta;
  if (!op || !op.insert || !op.attributes || isEOLOp(op)) {
    return void 0;
  }
  const attrs = op.attributes;
  const keys = Object.keys(attrs);
  const result: AttributeMap = {};
  for (const key of keys) {
    // 当前节点为 void 时, 不需要处理文本
    if (editor.schema.void.has(key)) {
      return void 0;
    }
    if (editor.schema.mark.has(key) && attrs[key]) {
      result[key] = attrs[key];
    }
    if (tail && editor.schema.inline.has(key)) {
      const next = ops[meta.index + 1];
      // 如果下个节点存在相同的属性, 则仍然需要追加属性
      if (next && next.attributes && next.attributes[key]) {
        continue;
      }
      delete result[key];
    }
  }
  return Object.keys(result).length ? result : void 0;
};
