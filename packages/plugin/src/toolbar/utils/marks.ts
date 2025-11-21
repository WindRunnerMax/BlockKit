import type { AttributeMap, Op } from "@block-kit/delta";
import { isEOLOp } from "@block-kit/delta";

export const filterMarkMap = (ops: Op[]): Record<string, string> => {
  const firstOp = ops[0];
  if (!firstOp || !firstOp.attributes) return {};
  // FIX: 取首个对象会被 immutable 的设计影响
  // 因此这里必须要将其 clone, 否则会影响渲染的内容
  const target: Record<string, string> = { ...firstOp.attributes };
  // 全部存在且相同的属性才认为是此时存在的 mark
  for (let i = 1; i < ops.length; i++) {
    const op = ops[i];
    // EOL Op 需要忽略
    if (isEOLOp(op)) continue;
    const attrs = op.attributes;
    const keys = attrs && Object.keys(attrs);
    if (!keys || !keys.length) return {};
    for (const key of keys) {
      if (attrs[key] !== target[key]) {
        delete target[key];
      }
    }
  }
  return target;
};

export const filterLineMarkMap = (attrs: AttributeMap[]): Record<string, string> => {
  if (!attrs.length) return {};
  // FIX: 取首个对象会被 immutable 的设计影响
  // 因此这里必须要将其 clone, 否则会影响渲染的内容
  const target: Record<string, string> = { ...attrs[0] };
  for (let i = 1; i < attrs.length; i++) {
    const keys = Object.keys(attrs[i]);
    if (!keys || !keys.length) return {};
    for (const key of keys) {
      if (attrs[i][key] !== target[key]) {
        delete target[key];
      }
    }
  }
  return target;
};
