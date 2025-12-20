import { SIDE } from "@block-kit/ot-json";
import { isString } from "@block-kit/utils";
import type { BlockMap, BlocksChange } from "@block-kit/x-json";
import { json } from "@block-kit/x-json";

import type { Range } from "../../selection/modules/range";
import { transformPosition } from "./normalize";

export class Transform {
  /**
   * 组合 BlockChange
   * @param base
   * @param other
   */
  public static compose(base: BlocksChange, other: BlocksChange) {
    const changes: BlocksChange = { ...base };
    for (const [key, ops] of Object.entries(other)) {
      if (!changes[key]) continue;
      changes[key] = json.compose(changes[key], ops);
    }
    return changes;
  }

  /**
   * 反转增量 invert
   * @param base 块级变更
   * @param snapshot 参数为变更应用前的状态快照, 以记录原属性值
   */
  public static invert(base: BlocksChange, snapshot: BlockMap) {
    const changes: BlocksChange = {};
    for (const [key, ops] of Object.entries(base)) {
      if (!changes[key] || !snapshot[key]) continue;
      changes[key] = json.invert(ops, snapshot[key].data || {});
    }
    return changes;
  }

  /**
   * 操作变换
   * @param base
   * @param other
   * @param priority true: this > other false: other > this
   */
  public static transform(base: BlocksChange, other: BlocksChange, priority = false) {
    const changes: BlocksChange = { ...base };
    for (const [key, ops] of Object.entries(other)) {
      if (!changes[key]) continue;
      changes[key] = json.transform(changes[key], ops, priority ? SIDE.RIGHT : SIDE.LEFT);
    }
    return changes;
  }

  /**
   * 根据内容变更事件，转换选区位置
   * @param changes
   * @param range
   */
  public static position(changes: BlocksChange, range: Range) {
    const deletes = new Set<string>();
    const inserts = new Set<string>();
    // 提取删除与新增的节点
    for (const ops of Object.values(changes)) {
      for (const op of ops) {
        if (op.p[0] === "children" && isString(op.li)) {
          inserts.add(op.li);
          continue;
        }
        if (op.p[0] === "children" && isString(op.ld)) {
          inserts.add(op.ld);
          continue;
        }
      }
    }
    // 如果节点同时被删除和插入, 则认为是更新操作
    for (const id of Array.from(inserts)) {
      if (!deletes.has(id)) continue;
      inserts.delete(id);
      deletes.delete(id);
    }
    return transformPosition({ inserts, deletes, changes }, range);
  }
}
