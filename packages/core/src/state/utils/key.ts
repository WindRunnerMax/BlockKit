import type { O } from "@block-kit/utils/dist/es/types";

export const NODE_TO_KEY = new WeakMap<O.Any, Key>();

export class Key {
  /** 当前节点 id */
  public id: string;
  /** 自动递增标识符 */
  public static n = 0;

  /**
   * 构造函数
   */
  constructor(preset?: string) {
    this.id = preset || `${Key.n++}`;
  }

  /**
   * 根据节点获取 id
   * @param node
   */
  public static getId(node: O.Any): string {
    let key = NODE_TO_KEY.get(node);
    if (!key) {
      key = new Key();
      NODE_TO_KEY.set(node, key);
    }
    return key.id;
  }

  /**
   * 根据节点刷新 id
   * @param node
   */
  public static refresh(node: O.Any): string {
    const key = new Key();
    NODE_TO_KEY.set(node, key);
    return key.id;
  }

  /**
   * 刷新 Key id
   * @param node
   * @param id
   */
  public static update(node: O.Any, id: string): string {
    const key = NODE_TO_KEY.get(node) || new Key(id);
    key.id = id;
    NODE_TO_KEY.set(node, key);
    return id;
  }
}
