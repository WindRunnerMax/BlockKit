import { isObjectLike } from "@block-kit/utils";
import type { O } from "@block-kit/utils/dist/es/types";

export const SIDE = {
  LEFT: "left",
  RIGHT: "right",
} as const;

/**
 * 深克隆
 * - 仅支持 Snapshot 定义的类型
 * @param value Snapshot/Op
 * @param cache WeakSet 作用域缓存
 */
export const clone = <T>(value: T, cache = new WeakSet<O.Any>()): T => {
  // 基本类型直接返回
  if (isObjectLike(value) === false) {
    return value;
  }
  // 检查是否已缓存, 如果已缓存, 直接返回原对象
  if (cache.has(value)) {
    return value as T;
  }
  // 缓存当前对象
  cache.add(value);
  // 处理数组
  if (Array.isArray(value)) {
    return value.map(it => clone(it, cache)) as T;
  }
  // 处理普通对象
  const clonedObj: Record<string, T> = {};
  for (const key of Object.keys(value)) {
    clonedObj[key] = clone(value[key], cache) as T;
  }
  return clonedObj as T;
};
