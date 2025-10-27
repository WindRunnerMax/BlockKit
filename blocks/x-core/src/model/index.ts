import type { Editor } from "@block-kit/core";

import type { BlockState } from "../state/modules/block-state";

export class Model {
  /** DOM To State */
  protected DOM_MODEL: WeakMap<HTMLElement, BlockState>;
  /** State To DOM */
  protected MODEL_DOM: WeakMap<BlockState, HTMLElement>;
  /** State To Text Editor */
  protected MODEL_EDITOR: WeakMap<BlockState, Editor>;

  /**
   * 构造函数
   */
  constructor() {
    this.DOM_MODEL = new WeakMap();
    this.MODEL_DOM = new WeakMap();
    this.MODEL_EDITOR = new WeakMap();
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.DOM_MODEL = new WeakMap();
    this.MODEL_DOM = new WeakMap();
    this.MODEL_EDITOR = new WeakMap();
  }

  /**
   * 映射 DOM - BlockState
   * @param node
   * @param state
   */
  public setBlockModel(node: HTMLDivElement, state: BlockState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }

  /**
   * 获取 Block State
   * @param node
   */
  public getBlockState(node: HTMLElement | null): BlockState | null {
    if (!node) return null;
    return <BlockState>this.DOM_MODEL.get(node) || null;
  }

  /**
   * 获取 Block DOM
   * @param state
   */
  public getBlockNode(state: BlockState | null): HTMLDivElement | null {
    if (!state) return null;
    return <HTMLDivElement>this.MODEL_DOM.get(state) || null;
  }

  /**
   * 映射 BlockState - Editor
   * @param state
   * @param editor
   */
  public setTextEditor(state: BlockState, editor: Editor) {
    this.MODEL_EDITOR.set(state, editor);
  }

  /**
   * 获取 Block Editor
   * @param state
   */
  public getTextEditor(state: BlockState | null): Editor | null {
    if (!state) return null;
    return this.MODEL_EDITOR.get(state) || null;
  }
}
