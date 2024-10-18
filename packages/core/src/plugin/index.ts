import type { Editor } from "../editor";
import type { CorePlugin } from "./modules/implement";
import type { CallerMap, CallerType } from "./types";

export class Plugin {
  /** 行级插件 */
  public lines: CorePlugin[];
  /** 所有插件 */
  public current: CorePlugin[];

  constructor(private editor: Editor) {
    this.lines = [];
    this.current = [];
  }

  /**
   * 批量注册插件
   * @param plugins
   * @note 支持单次批量注册
   */
  public register = (...plugins: CorePlugin[]) => {
    const map: Record<string, CorePlugin> = {};
    for (const plugin of plugins) {
      map[plugin.key] = plugin;
      plugin.renderLine && this.lines.push(plugin);
    }
    this.current = Object.values(map);
  };

  /**
   * 批量调度插件 Hook
   * @param key
   * @param payload
   */
  public call<T extends CallerType>(key: T, payload: CallerMap[T]): CallerMap[T] {
    const plugins = this.current;
    for (const plugin of plugins) {
      try {
        // @ts-expect-error payload match
        plugin[key] && isFunction(plugin[key]) && plugin[key](payload);
      } catch (error) {
        this.editor.logger.warning(`Plugin ${plugin} Exec Error`, error);
      }
    }
    return payload;
  }

  /**
   * 销毁插件
   */
  public destroy(): void {
    for (const plugin of this.lines) {
      plugin.destroy();
    }
  }
}
