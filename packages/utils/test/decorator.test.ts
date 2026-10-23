import { Bind } from "../src/decorator";

describe("decorator", () => {
  it("Bind", () => {
    class Test {
      @Bind
      method() {
        return this;
      }
    }
    const test = new Test();
    const method = test.method;
    expect(method()).toBe(test);
  });

  it("should keep stable reference for on/off", () => {
    class Test {
      @Bind
      method() {}
    }
    const test = new Test();
    // 事件订阅依赖引用稳定，多次读取必须是同一个函数
    expect(test.method).toBe(test.method);
    // 首次访问后缓存为实例自有属性，不再走原型上的 getter
    expect(Object.prototype.hasOwnProperty.call(test, "method")).toBe(true);
  });

  it("should not rebind on nested access", () => {
    class Test {
      public calls: number[] = [];
      @Bind
      method() {
        this.calls.push(1);
        // 方法内部再次访问自身，不能触发二次绑定或递归
        return this.method === this.method;
      }
    }
    const test = new Test();
    expect(test.method()).toBe(true);
    expect(test.calls).toEqual([1]);
  });

  it("should bind independently per instance", () => {
    class Test {
      @Bind
      method() {
        return this;
      }
    }
    const first = new Test();
    const second = new Test();
    const firstMethod = first.method;
    const secondMethod = second.method;
    expect(firstMethod).not.toBe(secondMethod);
    expect(firstMethod()).toBe(first);
    expect(secondMethod()).toBe(second);
  });

  it("should allow subclass override", () => {
    class Parent {
      @Bind
      protected onKey(): string {
        return "parent";
      }
    }
    class Child extends Parent {
      @Bind
      protected onKey(): string {
        return "child";
      }
    }
    const child = new Child() as unknown as { onKey: () => string };
    expect(child.onKey()).toBe("child");
  });

  it("should keep subclass method reference stable", () => {
    class Parent {
      @Bind
      protected onKey() {}
    }
    class Child extends Parent {
      @Bind
      protected onKey() {}
    }
    const child = new Child() as unknown as { onKey: () => void };
    expect(child.onKey).toBe(child.onKey);
  });

  it("should throw when decorating non-function", () => {
    const descriptor: PropertyDescriptor = { value: 1 };
    expect(() => Bind({}, "value", descriptor)).toThrow(TypeError);
  });

  it("should throw when decorating getter", () => {
    class Test {
      get value() {
        return 1;
      }
    }
    const descriptor = Object.getOwnPropertyDescriptor(Test.prototype, "value")!;
    expect(() => Bind(Test.prototype, "value", descriptor)).toThrow(TypeError);
  });
});
