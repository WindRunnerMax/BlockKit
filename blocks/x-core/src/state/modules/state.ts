import { getOpLength } from "@block-kit/delta";
import { isUndef } from "@block-kit/utils";
import type { Block, BlockDataField } from "@block-kit/x-json";
import { cloneSnapshot } from "@block-kit/x-json";

import { STATE_TO_RENDER } from "../../model/utils/weak-map";
import { isBoxBlockType } from "../../schema/utils/is";
import type { EditorState } from "../index";
import { getNextSiblingNode, getPrevSiblingNode } from "../utils/tree";

export class BlockState {
  /** Block ID */
  public readonly id: string;
  /** Block 可变数据 */
  public readonly data: BlockDataField;
  /** Block 类型 */
  public type: string;
  /** Block 版本 */
  public version: number;
  /** 标记是否删除 */
  public removed: boolean;
  /** Block 父节点索引 */
  public index: number;
  /** 块结构深度 */
  public depth: number;
  /** 最近块结构深度(线性深度) */
  public linear: number;
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
  public constructor(
    block: Block,
    /** 编辑器 Block 容器状态 */
    public container: EditorState
  ) {
    this.index = -1;
    this.depth = -1;
    this.length = -1;
    this.linear = -1;
    this._nodes = null;
    this.children = [];
    this.id = block.id;
    this.parent = null;
    this.isDirty = true;
    this.removed = true;
    this._nodesIndex = {};
    this.type = block.data.type;
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
    return prevId ? this.container.getBlock(prevId) : null;
  }

  /**
   * 获取同级的下一个相邻节点
   */
  public next(): BlockState | null {
    const parent = this.parent;
    if (!parent || !parent.data.children) return null;
    const nextId = parent.data.children[this.index + 1];
    return nextId ? this.container.getBlock(nextId) : null;
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
   * 获取 State 对应的 DOM 节点
   */
  public getDOMNode() {
    return this.container.editor.model.getBlockNode(this);
  }

  /**
   * 重新渲染块结构 [re-render]
   * - 需要视图层配合实现渲染
   */
  public forceRender() {
    const update = STATE_TO_RENDER.get(this);
    if (!update) {
      this.container.editor.logger.info(`Cannot Force Render Block ${this.id}`);
    }
    update && update();
  }

  /**
   * 标记块重新挂载
   */
  public restore() {
    if (!this.removed) return void 0;
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
   * - 当前树节点所有子节点, 含自身节点(首个节点为当前节点)
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
   * @param force [?=false] 是否强制更新
   */
  public _updateMeta(force = false): void {
    if (!this.isDirty && !force) return void 0;
    this.isDirty = false;
    // ============ Update Index ============
    // 更新子节点 index, 直接根据父节点的子节点重新计算
    // 注意这是更新该节点的子节点索引值, 而不是更新本身的索引值
    {
      this.type = this.data.type;
      const parent = this.container.getBlock(this.data.parent);
      this.parent = parent || null;
      const len = this.data.children.length;
      this.children.length = 0;
      for (let i = 0; i < len; i++) {
        const id = this.data.children[i];
        const child = this.container.getOrCreateBlock(id);
        child.index = i;
        child.parent = this;
        child.data.parent = this.id;
        this.children.push(child);
      }
    }
    // ============ Update Depth ============
    // 更新节点 depth, 不断查找父节点来确定深度
    // 数据结构通常是宽而浅的树形结构, 性能消耗通常可接受
    {
      let depth = 0;
      let linear = 0;
      let prevent = false;
      const visited = new Set<BlockState>();
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let current: BlockState | null = this;
      while (current) {
        // 从数据中取父节点, 避免元数据更新时节点树结构状态未更新问题
        const parent = this.container.getBlock(current.data.parent);
        if (!parent || visited.has(current)) {
          break;
        }
        visited.add(current);
        depth++;
        // 容器节点需要停止 linear 的计算, 隔离作用范围
        if (isBoxBlockType(current)) prevent = true;
        !prevent && linear++;
        current = parent;
      }
      this.depth = depth;
      this.linear = linear;
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
}
