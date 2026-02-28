import type { AttributeMap, Op } from "@block-kit/delta";
import type { P } from "@block-kit/utils/dist/es/types";

import type {
  CopyContext,
  DeserializeContext,
  PasteContext,
  SerializeContext,
} from "../../clipboard/types";
import type { Editor } from "../../editor";
import type { LineState } from "../../state/modules/line-state";
import type { LeafContext, LineContext } from "../types/context";

export abstract class CorePlugin {
  /** 自动注入编辑器实例 */
  protected editor!: Editor;
  /** 插件注册编辑器容器 */
  public static editor: Editor | null = null;
  /** 避免自动注入编辑器实例的异常抛出 */
  public static preventInjectEditorError: boolean = false;

  constructor() {
    if (!new.target.preventInjectEditorError && !CorePlugin.editor) {
      throw new Error(`${this} - Miss Editor Container`);
    }
    this.editor = CorePlugin.editor!;
  }
  /**
   * 插件唯一标识
   */
  public abstract readonly key: string;
  /**
   * 插件销毁时调度
   */
  public abstract destroy(): void;
  /**
   * 叶子节点/行节点的插件匹配
   * - 与 renderLine/renderLeaf 方法匹配使用
   * */
  public abstract match(attrs: AttributeMap, op: Op): boolean;
  /**
   * 渲染行节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderLine?(context: LineContext): P.Any;
  /**
   * 渲染块级子节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderLeaf?(context: LeafContext): P.Any;
  /**
   * 将 Fragment(Delta) 序列化为 HTML
   */
  public serialize?(context: SerializeContext): SerializeContext;
  /**
   * 将 HTML 反序列化为 Fragment(Delta)
   */
  public deserialize?(context: DeserializeContext): DeserializeContext;
  /**
   * 内容即将写入剪贴板
   */
  public willSetToClipboard?(context: CopyContext): CopyContext;
  /**
   * 粘贴的内容即将应用到编辑器
   */
  public willApplyPasteDelta?(context: PasteContext): PasteContext;
  /**
   * 编辑器行结构布局计算后同步调用
   * - 通常仅用于行级别的 Dirty DOM 检查, 务必谨慎调度
   * - 重渲染 Layout 同步调用, 需要严格避免复杂计算以及布局处理
   */
  public willPaintLineState?(lineState: LineState): void;
  /**
   * 编辑器行结构布局计算后异步调用
   */
  public didPaintLineState?(lineState: LineState): void;
}
