import type { P } from "./types";

/**
 * 异步延迟 [非精准]
 * @param ms 毫秒
 */
export const sleep = (ms: number): Promise<NodeJS.Timeout> => {
  return new Promise(resolve => {
    let id: NodeJS.Timeout | null = null;
    id = setTimeout(() => resolve(id!), ms);
  });
};

/**
 * Go-Style 异步异常处理
 * @param promise
 */
export const to = <T, U extends Error>(
  promise: Promise<T>
): Promise<[null, T] | [U, undefined]> => {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((error: U) => {
      if (error instanceof Error === false) {
        return [new Error(String(error)) as U, undefined];
      }
      return [error, undefined];
    });
};

/**
 * 检查对象是否含有指定的自有属性
 * @param element
 * @param key
 */
export const hasOwnProperty = <T extends P.Any, K extends PropertyKey>(
  element: T,
  key: K
): element is T & Record<K, unknown> => {
  return Object.prototype.hasOwnProperty.call(element, key);
};
