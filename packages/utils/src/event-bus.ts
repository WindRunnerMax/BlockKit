import { DEFAULT_PRIORITY } from "./constant";
import type { O } from "./types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventBusType {}
export type EventKeys<E extends O.Any> = keyof E;
export type EventContext = Omit<InternalEventContext, "_stopped" | "_prevented">;
export type Listeners<E extends O.Any> = { [T in EventKeys<E>]?: EventHandler<E, T>[] };

export type InternalEventContext = {
  /** 事件名 */ key: string | number | symbol;
  /** @internal 已停止顺序执行 */ _stopped: boolean;
  /** @internal 已阻止默认行为 */ _prevented: boolean;
  /** 停止顺序执行 */ stop: () => void;
  /** 阻止默认行为 */ prevent: () => void;
};

export type Listener<E extends O.Any, T extends EventKeys<E>> = (
  payload: E[T],
  context: EventContext
) => unknown;

export type EventHandler<E extends O.Any, T extends EventKeys<E>> = {
  once: boolean;
  priority: number;
  listener: Listener<E, T>;
};

export class EventBus<E extends O.Any = EventBusType> {
  /**
   * 事件监听器
   */
  private listeners: Listeners<E> = {};

  /**
   * 监听事件
   * @param key
   * @param listener
   * @param priority 默认为 100
   */
  public on<T extends EventKeys<E>>(key: T, listener: Listener<E, T>, priority = DEFAULT_PRIORITY) {
    this.addEventListener(key, listener, priority, false);
  }

  /**
   * 一次性事件监听
   * @param key
   * @param listener
   * @param priority 默认为 100
   */
  public once<T extends EventKeys<E>>(
    key: T,
    listener: Listener<E, T>,
    priority = DEFAULT_PRIORITY
  ) {
    this.addEventListener(key, listener, priority, true);
  }

  /**
   * 添加事件监听
   * @param key
   * @param listener
   * @param priority
   * @param once
   */
  private addEventListener<T extends EventKeys<E>>(
    key: T,
    listener: Listener<E, T>,
    priority: number,
    once: boolean
  ) {
    const handler: EventHandler<E, T>[] = this.listeners[key] || [];
    if (!handler.some(item => item.listener === listener)) {
      handler.push({ listener, priority, once });
    }
    handler.sort((a, b) => a.priority - b.priority);
    this.listeners[key] = <EventHandler<E, T>[]>handler;
  }

  /**
   * 移除事件监听
   * @param key
   * @param listener
   */
  public off<T extends EventKeys<E>>(key: T, listener: Listener<E, T>) {
    const handler = this.listeners[key];
    if (!handler) return void 0;
    // COMPAT: 不能直接`splice` 可能会导致`trigger`时打断`forEach`
    const next = handler.filter(item => item.listener !== listener);
    this.listeners[key] = <EventHandler<E, T>[]>next;
  }

  /**
   * 触发事件
   * @param key
   * @param listener
   * @returns prevented
   */
  public emit<T extends EventKeys<E>>(key: T, payload: E[T]): boolean {
    const handler = this.listeners[key];
    if (!handler) return false;
    const context: InternalEventContext = {
      key: key,
      _stopped: false,
      _prevented: false,
      stop: () => {
        context._stopped = true;
      },
      prevent: () => {
        context._prevented = true;
      },
    };
    for (const item of handler) {
      try {
        item.listener(payload, context);
      } catch (error) {
        console.error(`EventBus: Error For Event`, item, error);
      }
      item.once && this.off(key, item.listener);
      if (context._stopped) {
        break;
      }
    }
    return context._prevented;
  }

  /**
   * 清理事件
   */
  public clear() {
    this.listeners = {};
  }
}
