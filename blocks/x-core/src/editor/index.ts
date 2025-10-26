import { LOG_LEVEL, Logger } from "@block-kit/core";

import { Event } from "../event";
import { Plugin } from "../plugin";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/types";
import type { EditorOptions } from "./types";
import { getInitialBlocks } from "./utils/constant";

export class BlockEditor {
  /** 编辑器 DOM 容器 */
  protected container: HTMLDivElement | null;
  /** 状态模块 */
  public state: EditorState;
  /** 日志模块 */
  public logger: Logger;
  /** 事件模块 */
  public event: Event;
  /** 插件模块 */
  public plugin: Plugin;

  /**
   * 构造函数
   * @param options
   */
  public constructor(options: EditorOptions = {}) {
    const { initial = getInitialBlocks(), logLevel = LOG_LEVEL.ERROR } = options;
    this.container = null;
    this.state = new EditorState(this, initial);
    this.event = new Event(this);
    this.logger = new Logger(logLevel);
    this.plugin = new Plugin(this);
  }

  /**
   * 挂载编辑器 DOM
   * @param container
   */
  public mount(this: BlockEditor, container: HTMLDivElement) {
    if (this.state.get(EDITOR_STATE.MOUNTED)) {
      console.warn("Editor has been mounted, please destroy it before mount again.");
    }
    this.container = container;
    this.state.set(EDITOR_STATE.MOUNTED, true);
    this.event.bind();
  }

  /**
   * 卸载编辑器 DOM
   */
  public unmount(this: BlockEditor) {
    this.event.unbind();
    this.container = null;
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }

  /**
   * 获取编辑器容器
   * @returns
   */
  public getContainer(this: BlockEditor) {
    if (!this.container) {
      const div = document.createElement("div");
      div.setAttribute("data-type", "mock");
      return div;
    }
    return this.container;
  }

  /**
   * 销毁编辑器
   */
  public destroy(this: BlockEditor) {
    this.event.unbind();
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }
}
