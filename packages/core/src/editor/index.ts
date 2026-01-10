import { Delta } from "@block-kit/delta";

import { Clipboard } from "../clipboard";
import { Command } from "../command";
import { Event } from "../event";
import { History } from "../history";
import { Input } from "../input";
import { LOG_LEVEL, Logger } from "../log";
import { Lookup } from "../lookup";
import { Model } from "../model";
import { Perform } from "../perform";
import { Plugin } from "../plugin";
import { Rect } from "../rect";
import { Schema } from "../schema";
import { Selection } from "../selection";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/types";
import { Tracer } from "../tracer";
import type { EditorOptions } from "./types";
import { BLOCK_LIKE } from "./utils/constant";

export class Editor {
  /** 编辑容器 */
  protected container: HTMLDivElement | null;
  /** 配置模块 */
  public schema: Schema;
  /** 事件模块 */
  public event: Event;
  /** 模型映射 */
  public model: Model;
  /** 输入模块 */
  public input: Input;
  /** 日志模块 */
  public logger: Logger;
  /** 插件模块 */
  public plugin: Plugin;
  /** 状态模块 */
  public state: EditorState;
  /** 选区模块 */
  public selection: Selection;
  /** 历史模块 */
  public history: History;
  /** 剪贴板模块 */
  public clipboard: Clipboard;
  /** 执行模块 */
  public perform: Perform;
  /** 命令模块 */
  public command: Command;
  /** 追踪模块 */
  public tracer: Tracer;
  /** 检索模块 */
  public lookup: Lookup;
  /** 位置模块 */
  public rect: Rect;

  /**
   * 构造函数
   * @param options
   */
  public constructor(options: EditorOptions = {}) {
    const {
      delta = new Delta(BLOCK_LIKE),
      logLevel = LOG_LEVEL.WARNING,
      schema = {},
      modules = {},
    } = options;
    this.container = null;
    const LoggerModule = modules.Logger || Logger;
    const SchemaModule = modules.Schema || Schema;
    const ModelModule = modules.Model || Model;
    const StateModule = modules.State || EditorState;
    const EventModule = modules.Event || Event;
    const SelectionModule = modules.Selection || Selection;
    const InputModule = modules.Input || Input;
    const PluginModule = modules.Plugin || Plugin;
    const HistoryModule = modules.History || History;
    const ClipboardModule = modules.Clipboard || Clipboard;
    const PerformModule = modules.Perform || Perform;
    const CommandModule = modules.Command || Command;
    const TracerModule = modules.Tracer || Tracer;
    const LookupModule = modules.Lookup || Lookup;
    const RectModule = modules.Rect || Rect;
    this.logger = new LoggerModule(logLevel);
    this.schema = new SchemaModule(schema);
    this.model = new ModelModule();
    this.state = new StateModule(this, delta);
    this.event = new EventModule(this);
    this.selection = new SelectionModule(this);
    this.input = new InputModule(this);
    this.plugin = new PluginModule(this);
    this.history = new HistoryModule(this);
    this.clipboard = new ClipboardModule(this);
    this.perform = new PerformModule(this);
    this.command = new CommandModule();
    this.tracer = new TracerModule(this);
    this.lookup = new LookupModule(this);
    this.rect = new RectModule(this);
  }

  /**
   * 挂载编辑器 DOM
   * @param container
   */
  public mount(this: Editor, container: HTMLDivElement) {
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
  public unmount(this: Editor) {
    this.event.unbind();
    this.container = null;
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }

  /**
   * 获取编辑器容器
   * @returns
   */
  public getContainer(this: Editor) {
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
  public destroy(this: Editor) {
    this.event.unbind();
    this.input.destroy();
    this.model.destroy();
    this.plugin.destroy();
    this.lookup.destroy();
    this.selection.destroy();
    this.history.destroy();
    this.clipboard.destroy();
    this.command.destroy();
    this.tracer.destroy();
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }
}
