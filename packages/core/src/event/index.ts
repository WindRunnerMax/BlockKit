import type { Editor } from "../editor";
import { EventBus } from "./bus";
import { NativeEvent } from "./native";

export class Event {
  /** 原生事件绑定 */
  protected nativeEvent: NativeEvent;
  /** 事件总线 */
  protected bus: EventBus;

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {
    this.bus = new EventBus();
    this.nativeEvent = new NativeEvent(this.bus, this.editor);
  }

  /**
   * 绑定事件
   */
  public bind() {
    this.nativeEvent.bind();
  }

  /**
   * 解绑事件
   */
  public unbind() {
    this.nativeEvent.unbind();
  }

  /**
   * 监听事件
   * @param key
   * @param listener
   * @param priority 默认为 100
   */
  public on: EventBus["on"] = (key, listener, priority) => {
    return this.bus.on(key, listener, priority);
  };

  /**
   * 一次性事件监听
   * @param key
   * @param listener
   * @param priority 默认为 100
   */
  public once: EventBus["once"] = (key, listener, priority) => {
    return this.bus.once(key, listener, priority);
  };

  /**
   * 移除事件监听
   * @param key
   * @param listener
   */
  public off: EventBus["off"] = (key, listener) => {
    return this.bus.off(key, listener);
  };

  /**
   * 触发事件
   * @param key
   * @param payload
   */
  public trigger: EventBus["emit"] = (key, payload) => {
    return this.bus.emit(key, payload);
  };

  /**
   * 销毁模块
   */
  public destroy() {
    this.unbind();
    this.bus.clear();
  }
}
