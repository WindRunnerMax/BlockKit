import { EventBus } from "../src/event-bus";

declare module "../src/event-bus" {
  interface EventBusType {
    test: null;
    test2: { a: 1 };
  }
}

describe("event-bus", () => {
  it("on", () => {
    const event = new EventBus();
    const spy = jest.fn();
    const spy2 = jest.fn();
    event.on("test", spy);
    event.on("test", spy);
    event.on("test2", spy2);
    event.emit("test", null);
    event.emit("test2", { a: 1 });
    // @ts-expect-error private
    const len = event.listeners.test?.length;
    expect(len).toEqual(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it("priority", () => {
    const event = new EventBus();
    const seq: unknown[] = [];
    const spy1 = jest.fn(() => {
      seq.push(spy1);
    });
    const spy2 = jest.fn(() => {
      seq.push(spy2);
    });
    event.on("test", spy2, 2);
    event.on("test", spy1, 1);
    event.emit("test", null);
    expect(seq[0]).toBe(spy1);
    expect(seq[1]).toBe(spy2);
  });

  it("once", () => {
    const event = new EventBus();
    const spy = jest.fn();
    event.once("test", spy);
    event.emit("test", null);
    event.emit("test", null);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("off", () => {
    const event = new EventBus();
    const spy = jest.fn();
    event.on("test", spy);
    event.off("test", spy);
    event.emit("test", null);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("standalone types", () => {
    type E = {
      test11: null;
      test22: { a: 1 };
    };
    const event = new EventBus<E>();
    const spy = jest.fn();
    const spy2 = jest.fn();
    event.on("test11", spy);
    event.on("test22", spy);
    event.on("test22", spy2);
    event.emit("test11", null);
    event.emit("test22", { a: 1 });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it("stop event", () => {
    type E = {
      test11: null;
    };
    const event = new EventBus<E>();
    const spy = jest.fn();
    const spy1 = jest.fn();
    event.on("test11", spy);
    event.on("test11", (_, context) => {
      context.stop();
    });
    event.on("test11", spy1);
    event.emit("test11", null);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy1).toHaveBeenCalledTimes(0);
  });
});
