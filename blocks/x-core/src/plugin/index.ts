import type { BlockEditor } from "../editor";

export class Plugin {
  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: BlockEditor) {}

  /**
   * 对外的插件注册方法
   * - 会在注册插件时进行 Hook
   */
  public get register() {
    /**
     * 批量注册插件
     * - 仅支持单次批量注册
     * @param plugins
     */
    function _register(this: Plugin) {}
    return _register;
  }
}
