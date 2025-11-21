import type { Op } from "@block-kit/ot-json";
import { SIDE } from "@block-kit/ot-json";

import { json } from "../modules/subtype";

/**
 * 批量 Op 归一化
 * - 归一化的操作才可以被直接应用
 * - 主体思路是假设 a 变更, 由其变更的影响来变换 b 操作
 * - 假设值为 abcd, 以 a 为基准, 变换 b/c/d, 然后以 b 为基准, 变换 c/d, 以此类推
 * @param ops
 */
export const normalizeBatchOps = (ops: Op[]) => {
  const copied: Op[] = ops.filter(op => op);
  for (let i = 0, len = copied.length; i < len; i++) {
    const base = copied[i];
    for (let k = i + 1; k < len; k++) {
      const op = copied[k];
      if (!op) continue;
      const nextOp = json.transform(op, base, SIDE.RIGHT);
      copied[k] = nextOp as Op;
    }
  }
  return copied.filter(Boolean);
};
