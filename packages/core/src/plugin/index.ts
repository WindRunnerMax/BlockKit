import { isFunction } from "@block-kit/utils";

import type { Editor } from "../editor";
import { CorePlugin } from "./modules/implement";
import { getPluginPriority } from "./modules/priority";
import type { CallerMap, CallerType, PluginFuncKeys, PluginRequiredKeyFunc } from "./types";

export class Plugin {
  /** 当前注册的插件 */
  public current: CorePlugin[];
  /** 插件缓存 */
  protected cache: Record<string, CorePlugin[]>;

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {
    this.cache = {};
    this.current = [];
  }

  /**
   * 销毁插件
   */
  public destroy(): void {
    if (CorePlugin.editor === this.editor) {
      CorePlugin.editor = null;
    }
    this.reset();
  }

  /**
   * 重置插件容器
   */
  public reset(): void {
    for (const plugin of this.current) {
      plugin.destroy();
    }
    this.cache = {};
    this.current = [];
  }

  /**
   * 对外的插件注册方法
   * - 会在注册插件时进行 Hook
   */
  public get register() {
    CorePlugin.editor = this.editor;
    /**
     * 批量注册插件
     * - 仅支持单次批量注册
     * @param plugins
     */
    function _register(this: Plugin, plugins: CorePlugin[]) {
      this.reset();
      const map: Record<string, CorePlugin> = {};
      for (const plugin of plugins) {
        // 如果已经注册过重名 key 的插件, 则需要先销毁
        if (map[plugin.key]) map[plugin.key].destroy();
        map[plugin.key] = plugin;
        // @ts-expect-error private property
        if (process.env.NODE_ENV === "development" && plugin.editor !== this.editor) {
          throw new TypeError(`Editor Instance Mismatch: ${plugin.key}`);
        }
      }
      this.current = Object.values(map);
      CorePlugin.editor = null;
    }
    return _register;
  }

  /**
   * 根据调用函数名, 获取带优先级的插件列表
   * @param key
   */
  public getPriorityPlugins<T extends PluginFuncKeys>(key: T): PluginRequiredKeyFunc<T>[] {
    const cache = this.cache[key] as PluginRequiredKeyFunc<T>[];
    if (cache) return cache;
    // 先过滤存在该 key 的插件
    const plugins = this.current.filter(plugin => plugin[key]);
    // 再根据优先级排序
    plugins.sort((a, b) => getPluginPriority(key, a) - getPluginPriority(key, b));
    this.cache[key] = plugins;
    return plugins as PluginRequiredKeyFunc<T>[];
  }

  /**
   * 批量调度插件 Hook
   * @param key
   * @param payload
   */
  public call<T extends CallerType>(key: T, payload: CallerMap[T]): CallerMap[T] {
    const plugins = this.getPriorityPlugins(key);
    let context = payload;
    for (const plugin of plugins) {
      try {
        const fn = plugin[key] as (v: CallerMap[T]) => CallerMap[T];
        const next = fn && isFunction(fn) && fn(context);
        if (next) {
          context = next;
        }
      } catch (error) {
        this.editor.logger.warning(`Plugin ${plugin} Exec Error`, error);
      }
    }
    return context;
  }
}
