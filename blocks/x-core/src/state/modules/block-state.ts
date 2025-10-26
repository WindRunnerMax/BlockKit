import type { Editor } from "@block-kit/core";
import { Delta, getOpLength } from "@block-kit/delta";
import { isString } from "@block-kit/utils";
import type { Block, BlockDataField, DeltaOp, JSONOp } from "@block-kit/x-json";
import { cloneSnapshot, createBlockTreeWalkerBFS, json } from "@block-kit/x-json";

import type { EditorState } from "../index";

export class BlockState {
  /** Block ID */
  public readonly id: string;
  /** Block 可变数据 */
  public readonly data: BlockDataField;
  /** Block 版本 */
  public version: number;
  /** 标记是否删除 */
  public deleted: boolean;
  /** Block 父节点索引 */
  public index: number;
  /** 块结构深度 */
  public depth: number;
  /** 标记更新节点 */
  public isDirty: boolean;
  /** 编辑器实例 */
  protected _text: Editor | null;

  /** 构造函数 */
  public constructor(block: Block, protected state: EditorState) {
    this.index = -1;
    this.depth = -1;
    this._text = null;
    this.id = block.id;
    this.isDirty = true;
    this.deleted = false;
    this.version = block.version;
    this.data = { ...block.data };
  }

  /**
   * 获取父节点
   */
  public getParent(): BlockState | null {
    const parentId = this.data.parent;
    return parentId ? this.state.getBlock(parentId) : null;
  }

  /**
   * 获取子节点
   */
  public getChildren(): Array<BlockState | null> {
    const childrenIds = this.data.children || [];
    return childrenIds.map(id => this.state.getBlock(id));
  }

  /**
   * 获取上一个相邻节点
   */
  public prev(): BlockState | null {
    const parent = this.getParent();
    if (!parent || !parent.data.children) return null;
    const prevId = parent.data.children[this.index - 1];
    return prevId ? this.state.getBlock(prevId) : null;
  }

  /**
   * 获取下一个相邻节点
   */
  public next(): BlockState | null {
    const parent = this.getParent();
    if (!parent || !parent.data.children) return null;
    const nextId = parent.data.children[this.index + 1];
    return nextId ? this.state.getBlock(nextId) : null;
  }

  /**
   * 获取文本编辑器实例
   * - 读取时会按需创建编辑器实例
   */
  public getTextEditor(): Editor | null {
    if (!this.deleted && this.data.delta && !this._text) {
      const initial = new Delta(this.data.delta);
      const text = this.state.editor.plugin.createTextEditor(initial);
      this._text = text;
    }
    return this._text;
  }

  /**
   * 获取文本内容的长度
   */
  public getTextLength(): number | null {
    if (this._text) {
      return this._text.state.block.length;
    }
    if (this.data.delta) {
      return this.data.delta.reduce((len, op) => {
        return len + getOpLength(op);
      }, 0);
    }
    return null;
  }

  /**
   * 块重新挂载
   */
  public restore() {
    this.deleted = false;
    if (this._text && process.env.NODE_ENV === "development") {
      console.warn("Text editor already exists.");
      return void 0;
    }
    this.getTextEditor();
  }

  /**
   * 块软删除
   */
  public remove() {
    this.deleted = true;
    this._text = null;
    this.isDirty = true;
  }

  /**
   * 转化为 Block 数据
   * @param deep [?=undef] 深拷贝
   */
  public toBlock(deep?: boolean): Block {
    const data = deep ? cloneSnapshot(this.data) : { ...this.data };
    if (data.children) {
      data.children = [...data.children];
    }
    return {
      id: this.id,
      data: data,
      version: this.version,
    };
  }

  /**
   * 更新块结构元信息
   * @internal 仅编辑器内部使用
   */
  public _updateMeta(): void {
    if (!this.isDirty) return void 0;
    this.isDirty = false;
    // ============ Update Index ============
    // 更新子节点 index, 直接根据父节点的子节点重新计算
    // 注意这是更新该节点的子节点索引值, 而不是更新本身的索引值
    if (this.data.children) {
      const len = this.data.children.length;
      for (let i = 0; i < len; i++) {
        const childId = this.data.children[i];
        const childBlock = this.state.getBlock(childId);
        childBlock && (childBlock.index = i);
      }
    }
    // ============ Update Depth ============
    // 更新节点 depth, 不断查找父节点来确定深度
    // 数据结构通常是宽而浅的树形结构, 性能消耗通常可接受
    let depth = 0;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: BlockState | null = this;
    while (current) {
      const parent = current.getParent();
      if (!parent) break;
      depth++;
      current = parent;
    }
    this.depth = depth;
  }

  /**
   * 应用数据变更
   * @internal 仅编辑器内部使用
   */
  public _apply(ops: JSONOp[]) {
    this.isDirty = true;
    this.version++;
    // 空路径情况应该由父级状态管理调度 Insert 处理
    const changes = ops.filter(op => op && op.p.length);
    json.apply(this.data, changes);
    const inserts: Set<string> = new Set();
    const deletes: Set<string> = new Set();
    for (const op of ops) {
      // 若是文本编辑器字段的变更, 则需要同步更新编辑器实例
      if (op.p[0] === "delta" && op.t === "delta" && this._text) {
        const deltaOps = op.o as DeltaOp[];
        this._text.state.apply(new Delta(deltaOps));
      }
      // 若是 children 的新增变更, 则需要同步相关的 Block 状态
      if (op.p[0] === "children" && isString(op.li)) {
        const walker = createBlockTreeWalkerBFS(this.state.blocks, op.li);
        for (const child of walker) {
          child.restore();
          child._updateMeta();
          inserts.add(child.id);
        }
      }
      // 若是 children 的删除变更, 则需要同步相关的 Block 状态
      if (op.p[0] === "children" && isString(op.ld)) {
        const walker = createBlockTreeWalkerBFS(this.state.blocks, op.ld);
        for (const child of walker) {
          child.remove();
          deletes.add(child.id);
        }
      }
    }
    this._updateMeta();
    return { inserts, deletes };
  }
}
