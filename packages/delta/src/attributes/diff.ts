import { isObject } from "@block-kit/utils";

import type { AttributeMap } from "./interface";

/**
 * 计算属性差异
 * @param basic
 * @param target
 */
export const diffAttributes = (
  a: AttributeMap = {},
  b: AttributeMap = {}
): AttributeMap | undefined => {
  if (!isObject(a)) a = {};
  if (!isObject(b)) b = {};
  const attributes = Object.keys(a)
    .concat(Object.keys(b))
    .reduce<AttributeMap>((attrs, key) => {
      if (a[key] !== b[key]) {
        attrs[key] = b[key] === undefined ? "" : b[key];
      }
      return attrs;
    }, {});
  return Object.keys(attributes).length > 0 ? attributes : undefined;
};

/**
 * 判断 basic 是否是 target 的子集
 * @param basic
 * @param target
 */
export const isSubsetAttributes = (
  basic: AttributeMap = {},
  target: AttributeMap = {}
): boolean => {
  if (!isObject(basic)) basic = {};
  if (!isObject(target)) target = {};
  return Object.keys(basic).every(key => {
    // 属性值认为 "" === undef === null
    if (!basic[key] && !target[key]) {
      return true;
    }
    return basic[key] === target[key];
  });
};
