import { isFunction } from "./is";

// ExperimentalDecorators
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html

/**
 * Bind 方法绑定装饰器
 * - 适用于方法，访问时把方法绑定到实例，稳定引用为实例自有属性
 * - 继承时子类重写同名方法可正常覆盖，父类构造中访问到的就是子类实现
 * @param target 原型对象或构造函数
 * @param key 方法名
 * @param descriptor 属性描述符
 */
export function Bind<T>(_: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  if (!isFunction(originalMethod)) {
    throw new TypeError(`${originalMethod} is not a function`);
  }

  return {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      Object.defineProperty(this, key, {
        value: boundFunction,
        configurable: true,
        enumerable: false,
      });
      return boundFunction;
    },
  };
}
