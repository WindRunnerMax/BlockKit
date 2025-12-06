import { getOpLength } from "@block-kit/delta";
import { isString, isUndef } from "@block-kit/utils";
import type { Block, BlockDataField, JSONOp } from "@block-kit/x-json";
import { cloneSnapshot, json } from "@block-kit/x-json";

import type { EditorState } from "../index";
import { clearTreeCache, getNextSiblingNode, getPrevSiblingNode } from "../utils/tree";

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
  /** @internal 子树节点索引映射 */
  public _nodesIndex: Record<string, number>;

  /** 构造函数 */
  public constructor(block: Block, protected state: EditorState) {
    this.index = -1;
    this.depth = -1;
    this.length = -1;
    this._nodes = null;
    this.children = [];
    this.id = block.id;
    this.parent = null;
    this._nodesIndex = {};
    this.isDirty = true;
    this.removed = false;
    this.version = block.version;
    this.data = { ...block.data };
  }

  /**
   * 获取同级的上一个相邻节点
   */
  public prev(): BlockState | null {
    const parent = this.parent;
    if (!parent || !parent.data.children) return null;
    const prevId = parent.data.children[this.index - 1];
    return prevId ? this.state.getBlock(prevId) : null;
  }

  /**
   * 获取同级的下一个相邻节点
   */
  public next(): BlockState | null {
    const parent = this.parent;
    if (!parent || !parent.data.children) return null;
    const nextId = parent.data.children[this.index + 1];
    return nextId ? this.state.getBlock(nextId) : null;
  }

  /**
   * 获取相邻的上一个节点
   * - 与 prev 方法不同的是, 该方法会跨越父节点查找上一个节点
   * @param strict [?=false] 严格查找文本节点
   */
  public prevSiblingNode(strict = false) {
    return getPrevSiblingNode(this, strict);
  }

  /**
   * 获取紧邻的下一个节点
   * - 与 next 方法不同的是, 该方法会跨越父节点查找下一个节点
   * @param strict [?=false] 严格查找文本节点
   */
  public nextSiblingNode(strict = false) {
    return getNextSiblingNode(this, strict);
  }

  /**
   * 判断是否为块级类型的节点
   * @returns
   */
  public isBlockType() {
    return !this.data.delta;
  }

  /**
   * 获取 State 对应的 DOM 节点
   */
  public getDOMNode() {
    return this.state.editor.model.getBlockNode(this);
  }

  /**
   * 标记块重新挂载
   */
  public restore() {
    this.removed = false;
    this._updateMeta();
  }

  /**
   * 标记块软删除
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
    let index = 0;
    this._nodesIndex = { [this.id]: index++ };
    for (const child of this.children) {
      const subNodes = child.getTreeNodes();
      for (const subNode of subNodes) {
        nodes.push(subNode);
        this._nodesIndex[subNode.id] = index++;
      }
    }
    this._nodes = nodes;
    return nodes;
  }

  /**
   * 获取树结构子节点索引值
   * @param id Block ID
   */
  public getTreeNodeIndex(id: string): number | null {
    !this._nodes && this.getTreeNodes();
    const index = this._nodesIndex[id];
    return isUndef(index) ? null : index;
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
      this.children = [];
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
    for (const op of changes) {
      // 若是 children 的新增变更, 则需要同步相关的 Block 状态
      LI_OP: if (op.p[0] === "children" && isString(op.li)) {
        isChildrenChanged = true;
        const liBlock = this.state.getOrCreateBlock(op.li);
        // 文本类型的节点仅需要处理本身
        if (!liBlock.isBlockType()) {
          liBlock.restore();
          inserts.add(liBlock.id);
          break LI_OP;
        }
        // 块级节点需要护理处理本身及其子树节点
        const nodes = liBlock.getTreeNodes();
        for (const child of nodes) {
          child.restore();
          inserts.add(child.id);
        }
      }
      // 若是 children 的删除变更, 则需要同步相关的 Block 状态
      LD_OP: if (op.p[0] === "children" && isString(op.ld)) {
        isChildrenChanged = true;
        const ldBlock = this.state.getOrCreateBlock(op.ld);
        // 文本类型的节点仅需要处理本身的删除状态, 子节点需要选区状态来维护
        if (!ldBlock.isBlockType()) {
          ldBlock.remove();
          deletes.add(ldBlock.id);
          break LD_OP;
        }
        // 块级节点需要护理处理本身及其子树节点
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
