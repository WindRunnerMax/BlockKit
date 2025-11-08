import { getOpLength } from "@block-kit/delta";
import { isString } from "@block-kit/utils";
import type { Block, BlockDataField, JSONOp } from "@block-kit/x-json";
import { cloneSnapshot, json } from "@block-kit/x-json";

import type { EditorState } from "../index";
import { clearTreeCache } from "../utils/tree";

export class BlockState {
  /** Block ID */
  public readonly id: string;
  /** Block 可变数据 */
  public readonly data: BlockDataField;
  /** Block 版本 */
  public version: number;
  /** 标记是否删除 */
  public removed: boolean;
  /** Block 父节点索引 */
  public index: number;
  /** 块结构深度 */
  public depth: number;
  /** 标记更新节点 */
  public isDirty: boolean;
  /** delta 文本长度 */
  public length: number;
  /** 父节点 */
  public parent: BlockState | null;
  /** 子节点 */
  public children: BlockState[];
  /** @internal 子树节点 */
  public _nodes: BlockState[] | null;

  /** 构造函数 */
  public constructor(block: Block, protected state: EditorState) {
    this.index = -1;
    this.depth = -1;
    this.length = -1;
    this._nodes = null;
    this.children = [];
    this.id = block.id;
    this.parent = null;
    this.isDirty = true;
    this.removed = false;
    this.version = block.version;
    this.data = { ...block.data };
  }

  /**
   * 获取上一个相邻节点
   */
  public prev(): BlockState | null {
    const parent = this.parent;
    if (!parent || !parent.data.children) return null;
    const prevId = parent.data.children[this.index - 1];
    return prevId ? this.state.getBlock(prevId) : null;
  }

  /**
   * 获取下一个相邻节点
   */
  public next(): BlockState | null {
    const parent = this.parent;
    if (!parent || !parent.data.children) return null;
    const nextId = parent.data.children[this.index + 1];
    return nextId ? this.state.getBlock(nextId) : null;
  }

  /**
   * 判断是否为块级节点
   * @returns
   */
  public isBlockNode() {
    return !this.data.delta;
  }

  /**
   * 获取 State 对应的 DOM 节点
   */
  public getDOMNode() {
    return this.state.editor.model.getBlockNode(this);
  }

  /**
   * 块重新挂载
   */
  public restore() {
    this.removed = false;
    this._updateMeta();
  }

  /**
   * 块软删除
   */
  public remove() {
    this.removed = true;
    this.isDirty = true;
  }

  /**
   * 获取树结构子节点的数据 [DFS BlockState]
   * - 当前树节点所有子节点, 含自身节点
   */
  public getTreeNodes(): BlockState[] {
    if (this._nodes) return this._nodes;
    const nodes: BlockState[] = [this];
    const children = this.data.children;
    for (const id of children) {
      const child = this.state.getOrCreateBlock(id);
      nodes.push(...child.getTreeNodes());
    }
    this._nodes = nodes;
    return nodes;
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
    {
      const parent = this.state.getBlock(this.data.parent);
      this.parent = parent || null;
      const len = this.data.children.length;
      for (let i = 0; i < len; i++) {
        const id = this.data.children[i];
        const child = this.state.getOrCreateBlock(id);
        child.index = i;
        child.parent = this;
        child.data.parent = this.id;
        this.children[i] = child;
      }
    }
    // ============ Update Depth ============
    // 更新节点 depth, 不断查找父节点来确定深度
    // 数据结构通常是宽而浅的树形结构, 性能消耗通常可接受
    {
      let depth = 0;
      const visited = new Set<BlockState>();
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let current: BlockState | null = this;
      while (current) {
        if (!current.parent || visited.has(current)) {
          break;
        }
        visited.add(current);
        depth++;
        current = current.parent;
      }
      this.depth = depth;
    }
    // ============ Update Length ============
    // 更新文本块 Delta 长度
    {
      if (this.data.delta) {
        let len = 0;
        for (const str of this.data.delta) {
          len = len + getOpLength(str);
        }
        this.length = len;
      }
    }
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
    let isChildrenChanged = false;
    const inserts: Set<string> = new Set();
    const deletes: Set<string> = new Set();
    for (const op of ops) {
      // 若是 children 的新增变更, 则需要同步相关的 Block 状态
      if (op.p[0] === "children" && isString(op.li)) {
        isChildrenChanged = true;
        const liBlock = this.state.getOrCreateBlock(op.li);
        const nodes = liBlock.getTreeNodes();
        for (const child of nodes) {
          child.restore();
          inserts.add(child.id);
        }
      }
      // 若是 children 的删除变更, 则需要同步相关的 Block 状态
      if (op.p[0] === "children" && isString(op.ld)) {
        isChildrenChanged = true;
        const ldBlock = this.state.getOrCreateBlock(op.ld);
        const nodes = ldBlock.getTreeNodes();
        for (const child of nodes) {
          child.remove();
          deletes.add(child.id);
        }
      }
    }
    isChildrenChanged && clearTreeCache(this);
    this._updateMeta();
    return { inserts, deletes };
  }
}
