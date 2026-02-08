import { NOOP } from "@block-kit/utils";
import type { P } from "@block-kit/utils/dist/es/types";
import type { BlockState } from "@block-kit/x-core";
import type { BlockDataType } from "@block-kit/x-json";

import type { XOrderStore } from "../types";
import { ORDER_KEY } from "../types";

export const isOrderBlock = (state: BlockState | P.Nil) => {
  if (!state) return false;
  return state.type === ORDER_KEY;
};

/**
 * 批量刷新 state 的列表序号 [批量刷新简单方便]
 * - 从选区开始的第一个列表项开始, 逐个刷新序号
 * - 全量刷新序号数据, 最后需要在渲染时批量刷新
 * @param editor
 * @param sel
 */
export const updateNewOrderList = (store: XOrderStore, state: BlockState | null) => {
  if (!state) return void 0;
  let start = state.index;
  const startBlock = state;
  const nextBlock = state.next();
  // 如果当前块不是有序列表, 且下一个块是有序列表, 则从下一个块开始探查
  if (!isOrderBlock(startBlock) && isOrderBlock(nextBlock)) {
    start++;
  }
  const parent = startBlock.parent;
  // 如果 start 的块不是有序列表, 则无需刷新
  if (!parent || !isOrderBlock(parent.children[start])) {
    return void 0;
  }
  // 向前查找到第一个有序列表
  while (--start >= 0) {
    const block = parent.children[start];
    if (!block) continue;
    const data = block.data as BlockDataType<"order">;
    // 若是当前块非有序列表, 或者值非自动计算的, 则需要重置 start
    if (!isOrderBlock(block) || data.start > 0) {
      start++;
      break;
    }
  }
  let orderIndex = -1;
  for (let i = start; i < parent.children.length; i++) {
    const block = parent.children[i];
    if (!block) continue;
    const data = block.data as BlockDataType<"order">;
    if (!isOrderBlock(block) || data.start > 0) {
      break;
    }
    if (orderIndex === -1) {
      orderIndex = data.start <= 0 ? 1 : data.start;
    }
    const payload = store[block.id];
    // 由于视图本身可能并未渲染, payload 可能为空
    // 因此若不存在 payload, 则先创建一个空的 payload
    if (!payload) {
      store[block.id] = { start: orderIndex, update: NOOP };
    } else {
      payload.start = orderIndex;
      payload.update();
    }
    orderIndex++;
  }
};
