import { isArray, isNil, isUndef } from "./is";
import type { Array, O, P } from "./types";

export class Collection {
  /**
   * Pick
   * @param target
   * @param keys
   */
  public static pick<T extends O.Any, K extends keyof T>(target: T, keys: K | K[]): Pick<T, K> {
    const picks = isArray(keys) ? keys : [keys];
    const next = {} as O.Map<unknown>;
    for (const key of picks) {
      if (isUndef(target[key])) continue;
      next[key as string] = target[key];
    }
    return next as T;
  }

  /**
   * Omit
   * @param target
   * @param keys
   */
  public static omit<T extends Array.Any>(target: T, keys: T): T;
  public static omit<T extends O.Any, K extends keyof T>(target: T, keys: K | K[]): Omit<T, K>;
  public static omit<T extends Array.Any | O.Any>(target: T, keys: Array.Any): T | O.Any {
    const copied = { ...target } as O.Unknown;
    const omits = isArray(keys) ? keys : [keys];
    for (const key of omits) {
      delete copied[key as string];
    }
    return copied as T;
  }

  /**
   * Patch 差异
   * @param a
   * @param b
   */
  public static patch<T>(
    a: Set<T> | T[],
    b: Set<T> | T[]
  ): { effects: Set<T>; added: Set<T>; removed: Set<T> } {
    const set1 = a instanceof Set ? a : new Set(a);
    const set2 = b instanceof Set ? b : new Set(b);
    const effects = new Set<T>();
    const added = new Set<T>();
    const removed = new Set<T>();
    for (const el of set2) {
      if (set1.has(el)) continue;
      added.add(el);
      effects.add(el);
    }
    for (const el of set1) {
      if (set2.has(el)) continue;
      removed.add(el);
      effects.add(el);
    }
    return { effects, added, removed };
  }

  /**
   * Union 并集
   * @param a
   * @param b
   */
  public static union<T>(a: Set<T> | T[], b: Set<T> | T[]): Set<T> {
    const merged = new Set<T>(a);
    for (const item of b) {
      merged.add(item);
    }
    return merged;
  }

  /**
   * Intersect 交集
   * @param a
   * @param b
   */
  public static intersect<T>(a: Set<T> | T[], b: Set<T> | T[]): Set<T> {
    let set1 = a instanceof Set ? a : new Set(a);
    let set2 = b instanceof Set ? b : new Set(b);
    // 总是遍历较小的集合
    if (set1.size > set2.size) {
      [set1, set2] = [set2, set1];
    }
    const result = new Set<T>();
    for (const item of set1) {
      set2.has(item) && result.add(item);
    }
    return result;
  }

  /**
   * Subset 判断是否子集
   * - a 是否是 b 的子集
   * @param a
   * @param b
   */
  public static subset<T>(a: Set<T> | T[], b: Set<T> | T[]): boolean {
    const set1 = a instanceof Set ? a : new Set(a);
    const set2 = b instanceof Set ? b : new Set(b);
    // 如果 set1 的大小超过 set2, 肯定不是子集
    if (set1.size > set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  /**
   * Superset 判断是否超集
   * - a 是否是 b 的超集
   * @param a
   * @param b
   */
  public static superset<T>(a: Set<T> | T[], b: Set<T> | T[]): boolean {
    const set1 = a instanceof Set ? a : new Set(a);
    const set2 = b instanceof Set ? b : new Set(b);
    // 如果 set1 的大小小于 set2, 肯定不是超集
    if (set1.size < set2.size) return false;
    for (const item of set2) {
      if (!set1.has(item)) return false;
    }
    return true;
  }

  /**
   * Symmetric 对等差集
   * - b 中存在而 a 中不存在的元素
   * @param a
   * @param b
   */
  public static symmetric<T>(a: Set<T> | T[], b: Set<T> | T[]): Set<T> {
    const set1 = a instanceof Set ? a : new Set(a);
    const set2 = b instanceof Set ? b : new Set(b);
    const result = new Set<T>();
    for (const item of set2) {
      !set1.has(item) && result.add(item);
    }
    return result;
  }

  /**
   * 取数组索引值
   * @param target
   * @param index 支持负数
   */
  public static at<T>(target: T[] | P.Nil, index: number): T | null {
    if (!target) return null;
    const i = index < 0 ? target.length + index : index;
    const value = target[i];
    return isNil(value) ? null : value;
  }
}
