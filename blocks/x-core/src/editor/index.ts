import { LOG_LEVEL, Logger } from "@block-kit/core";

import { Event } from "../event";
import { History } from "../history";
import { Input } from "../input";
import { Lookup } from "../lookup";
import { Model } from "../model";
import { Perform } from "../perform";
import { Plugin } from "../plugin";
import { Rect } from "../rect";
import { Schema } from "../schema";
import { Selection } from "../selection";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/types";
import type { EditorOptions } from "./types";
import { getInitialBlocks } from "./utils/constant";

export class BlockEditor {
  /** 编辑器 DOM 容器 */
  protected container: HTMLDivElement | null;
  /** 配置模块 */
  public schema: Schema;
  /** 状态模块 */
  public state: EditorState;
  /** 日志模块 */
  public logger: Logger;
  /** 事件模块 */
  public event: Event;
  /** 插件模块 */
  public plugin: Plugin;
  /** 模型映射 */
  public model: Model;
  /** 选区模块 */
  public selection: Selection;
  /** 检索模块 */
  public lookup: Lookup;
  /** 变更模块 */
  public perform: Perform;
  /** 输入模块 */
  public input: Input;
  /** 历史模块 */
  public history: History;
  /** 位置模块 */
  public rect: Rect;

  /**
   * 构造函数
   * @param options
   */
  public constructor(options: EditorOptions = {}) {
    const {
      initial = getInitialBlocks(),
      logLevel = LOG_LEVEL.ERROR,
      rules = {},
      schema = {},
    } = options;
    this.container = null;
    this.logger = new Logger(logLevel);
    this.schema = new Schema(rules, schema);
    this.state = new EditorState(this, initial);
    this.event = new Event(this);
    this.plugin = new Plugin(this);
    this.model = new Model();
    this.selection = new Selection(this);
    this.lookup = new Lookup(this);
    this.perform = new Perform(this);
    this.input = new Input(this);
    this.plugin = new Plugin(this);
    this.history = new History(this);
    this.rect = new Rect(this);
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
    this.input.destroy();
    this.event.unbind();
    this.plugin.destroy();
    this.selection.destroy();
    this.history.destroy();
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }
}
