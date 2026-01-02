import type { P } from "@block-kit/utils/dist/es/types";

import type { BlockEditor } from "../../editor";
import type { BlockState } from "../../state/modules/block-state";
import type { BlockContext, BlockWrapContext, TextWrapContext } from "../types/context";

export abstract class CorePlugin {
  /** 插件注册编辑器容器 */
  public static editor: BlockEditor | null = null;
  /** 自动注入编辑器实例 */
  protected editor!: BlockEditor;

  /** 构造函数 */
  constructor() {
    if (!CorePlugin.editor) {
      throw new Error(`${this} - Miss Editor Container`);
    }
    this.editor = CorePlugin.editor;
  }

  /**
   * 插件唯一标识
   * - 渲染块结构时会匹配 Block 的 type 字段
   * - 意味着块结构需要一一对应, 取代了 match 方法的作用
   */
  public abstract readonly key: string;

  /**
   * 插件销毁时调度
   */
  public abstract destroy(): void;

  /**
   * 渲染块级节点 Block
   * - 渲染范围为 Block 节点, Wrap 节点之下
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderBlock?(state: BlockContext): P.Any;

  /**
   * 渲染块级文本包装节点
   * - 渲染范围在 Text 节点之上, Wrap 节点之下
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderTextWrap?(state: TextWrapContext): P.Any;

  /**
   * 渲染块级包裹节点
   * - 渲染范围在 Block 节点之上, Wrap 节点之下
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderBlockWrap?(state: BlockWrapContext): P.Any;

  /**
   * 将 Blocks 序列化为 HTML
   */
  public serialize?(context: P.Any): P.Any;

  /**
   * 将 HTML 反序列化为 Blocks
   */
  public deserialize?(context: P.Any): P.Any;

  /**
   * 内容即将写入剪贴板
   */
  public willSetToClipboard?(context: P.Any): P.Any;

  /**
   * 粘贴的内容即将应用到编辑器
   */
  public willApplyPasteDelta?(context: P.Any): P.Any;

  /**
   * 编辑器行结构布局计算后同步调用
   * - 通常仅用于行级别的 Dirty DOM 检查, 务必谨慎调度
   * - 重渲染 Layout 同步调用, 需要严格避免复杂计算以及布局处理
   */
  public willPaintBlockState?(blockState: BlockState): void;

  /**
   * 编辑器行结构布局计算后异步调用
   */
  public didPaintBlockState?(blockState: BlockState): void;
}
