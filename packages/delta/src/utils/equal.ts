import type { AttributeMap } from "../attributes/interface";
import type { Delta } from "../delta/delta";
import type { Op } from "../delta/interface";

/**
 * 判断两个 AttributeMap 是否相等
 * @param o
 * @param t
 */
export const isEqualAttributes = (o: AttributeMap | undefined, t: AttributeMap | undefined) => {
  if (!o && !t) return true;
  // 在 op 对象的 attrs 中, void 和 {} 都作为空属性
  const origin = o || {};
  const target = t || {};
  const originKeys = Object.keys(origin);
  const targetKeys = Object.keys(target);
  if (originKeys.length !== targetKeys.length) {
    return false;
  }
  for (const key of originKeys) {
    if (origin[key] !== target[key]) return false;
  }
  return true;
};

/**
 * 判断两个 Op 是否相等
 * @param origin
 * @param target
 */
export const isEqualOp = (origin: Op | undefined, target: Op | undefined) => {
  if (origin === target) return true;
  if (!origin || !target) return false;
  if (origin.insert !== target.insert) return false;
  if (origin.delete !== target.delete) return false;
  if (origin.retain !== target.retain) return false;
  if (!isEqualAttributes(origin.attributes, target.attributes)) return false;
  return true;
};

/**
 * 判断两个 Delta 是否相等
 * @param origin
 * @param target
 */
export const isEqualDelta = (origin: Delta, target: Delta) => {
  if (origin === target || origin.ops === target.ops) return true;
  if (origin.ops.length !== target.ops.length) return false;
  return origin.ops.every((op, index) => isEqualOp(op, target.ops[index]));
};
