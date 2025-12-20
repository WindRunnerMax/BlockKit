import { getId, ROOT_BLOCK } from "@block-kit/utils";
import type { P } from "@block-kit/utils/dist/es/types";
import type { BlockMap } from "@block-kit/x-json";
import type { Block } from "@block-kit/x-json";

import type { BlockEditor } from "../editor";
import type { ContentChangeEvent } from "../event/bus";
import { EDITOR_EVENT } from "../event/bus";
import type { Range } from "../selection/modules/range";
import { BlockState } from "./modules/block-state";
import { Mutate } from "./mutate";
import type { ApplyOptions, BatchApplyChange } from "./types";
import { APPLY_SOURCE, EDITOR_STATE } from "./types";
import { normalizeBlocksChange, transformPosition } from "./utils/normalize";

export class EditorState {
  /** 内建状态集合 */
  protected readonly status: Record<string, boolean>;
  /** Block 集合 */
  public readonly blocks: Record<string, BlockState>;
  /** Root ID */
  public readonly rootId: string;
  /** Block 集合缓存 */
  protected _cache: BlockMap | null;

  /**
   * 构造函数
   * @param editor
   * @param initial
   */
  constructor(public editor: BlockEditor, initial: BlockMap) {
    this._cache = null;
    this.status = {};
    this.blocks = {};
    this.rootId = "";
    const usedIds = new Set<string>();
    // 建立 Blocks 集合
    for (const block of Object.values(initial)) {
      if (block.data.type === ROOT_BLOCK) {
        usedIds.add(block.id);
        this.rootId = block.id;
      }
      this.blocks[block.id] = new BlockState(block, this);
      block.data.children.forEach(id => usedIds.add(id));
    }
    // 建立树集合后更新元信息, 并构建树结构
    for (const state of Object.values(this.blocks)) {
      usedIds.has(state.id) ? state._updateMeta() : state.remove();
    }
  }

  /**
   * 获取编辑器状态
   * @param key
   */
  public get(key: keyof typeof EDITOR_STATE) {
    return this.status[key];
  }

  /**
   * 设置编辑器状态
   * @param key
   * @param value
   */
  public set(key: keyof typeof EDITOR_STATE, value: boolean) {
    this.status[key] = value;
    return this;
  }

  /**
   * 判断焦点是否在编辑器内
   */
  public isFocused() {
    const textarea = this.editor.selection.element;
    if (textarea && document.activeElement === textarea) {
      return true;
    }
    return !!this.get(EDITOR_STATE.FOCUS);
  }

  /**
   * 判断编辑器是否只读
   */
  public isReadonly() {
    return !!this.get(EDITOR_STATE.READONLY);
  }

  /**
   * 判断编辑器是否正在组合输入
   */
  public isComposing() {
    return !!this.get(EDITOR_STATE.COMPOSING);
  }

  /**
   * 获取 BlockState
   * @param id Block ID
   */
  public getBlock(id: string): BlockState | null {
    return this.blocks[id] || null;
  }

  /**
   * 获取 BlockState
   * - 若是不存在则创建 BlockState
   * @param id Block ID
   */
  public getOrCreateBlock(id: string): BlockState {
    if (!this.blocks[id]) {
      const textBlock: Block = {
        id,
        version: 1,
        data: { parent: "", type: "text", delta: [], children: [] },
      };
      this.blocks[id] = new BlockState(textBlock, this);
      this.editor.logger.warning("BlockState Not Found:", id);
    }
    return this.blocks[id];
  }

  /**
   * 获取 Root BlockState
   */
  public getRootBlock(): BlockState {
    return this.blocks[this.rootId]!;
  }

  /**
   * 转换为 Block 集合
   * - 以内建状态为主, Block 集合数据按需转换
   * @param deep [?=undef] 深拷贝
   */
  public toBlockSet(deep?: boolean): BlockMap {
    if (!deep && this._cache) {
      return this._cache;
    }
    const result: BlockMap = {};
    for (const block of Object.values(this.blocks)) {
      if (block.removed) continue;
      result[block.id] = block.toBlock(deep);
    }
    this._cache = result;
    return result;
  }

  /**
   * 应用编辑器变更
   * @param changes
   * @param options
   */
  public apply(changes: BatchApplyChange, options: ApplyOptions = {}) {
    const { source = APPLY_SOURCE.USER, autoCaret = true, preventNormalize = false } = options;
    const previous = this.toBlockSet();
    this._cache = null;
    const normalized = normalizeBlocksChange(changes, preventNormalize);

    this.editor.event.trigger(EDITOR_EVENT.CONTENT_WILL_CHANGE, {
      options,
      current: previous,
      source: source,
      changes: normalized,
      extra: options.extra,
    });

    const mutate = new Mutate(this);
    const { inserts, updates, deletes } = mutate.apply(normalized);

    const id = getId(6);
    const current = this.toBlockSet();
    const payload: ContentChangeEvent = {
      id: id,
      options,
      previous: previous,
      current: current,
      source: source,
      changes: normalized,
      inserts: inserts,
      updates: updates,
      deletes: deletes,
      extra: options.extra,
    };

    let nextRange: Range | P.Nil = options.selection;
    if (autoCaret && !nextRange) {
      const range = this.editor.selection.get();
      nextRange = range ? transformPosition(payload, range) : null;
    }
    nextRange && this.editor.selection.set(nextRange);

    this.editor.logger.debug("Editor Content Change", payload);
    this.editor.event.trigger(EDITOR_EVENT.CONTENT_CHANGE, payload);
    return payload;
  }
}
