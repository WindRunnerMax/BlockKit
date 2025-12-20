import { Delta } from "@block-kit/delta";
import type { BlocksChange } from "@block-kit/x-json";
import { isTextDeltaOp, normalizeBatchOps } from "@block-kit/x-json";

import type { ContentChangeEvent } from "../../event/bus";
import { Entry } from "../../selection/modules/entry";
import { Range } from "../../selection/modules/range";
import { POINT_TYPE } from "../../selection/utils/constant";
import type { ApplyChange } from "../types";

/**
 * 规范化变更
 * @param changes
 * @returns
 */
export const normalizeBlocksChange = (
  changes: Array<ApplyChange | ApplyChange[]>,
  preventNormalize: boolean
): BlocksChange => {
  // 将相同 Block Id 的变更合并
  const mergedChange: BlocksChange = {};
  for (const change of changes) {
    const entries = Array.isArray(change) ? change : [change];
    for (const item of entries) {
      const blockId = item.id;
      const ops = item.ops;
      mergedChange[blockId] = mergedChange[blockId] || [];
      mergedChange[blockId].push(...ops);
    }
  }
  if (preventNormalize) return mergedChange;
  // 对每个 Block 的变更进行规范化处理
  const normalized: BlocksChange = {};
  for (const [changeId, ops] of Object.entries(mergedChange)) {
    normalized[changeId] = normalizeBatchOps(ops);
  }
  return normalized;
};

/**
 * 从 BlocksChange 恢复为 ApplyChange
 * @param changes
 */
export const restoreApplyChange = (changes: BlocksChange): ApplyChange[] => {
  const applies: ApplyChange[] = [];
  for (const [id, ops] of Object.entries(changes)) {
    applies.push({ id, ops });
  }
  return applies;
};

/**
 * 根据内容变更事件，转换选区位置
 * @param payload
 * @param range
 */
export const transformPosition = (
  payload: Pick<ContentChangeEvent, "inserts" | "deletes" | "changes">,
  range: Range
) => {
  const entries = range.clone().nodes;
  const newEntries: typeof entries = [];
  const { deletes, inserts } = payload;
  for (const entry of entries) {
    // 已经删除的节点需要跳过
    if (deletes.has(entry.id)) continue;
    const ops = payload.changes[entry.id];
    // 处理纯文本选区 Entry
    if (Entry.isText(entry) && ops) {
      let isAppliedDelta = false;
      let start = entry.start;
      let end = entry.start + entry.len;
      for (const op of ops) {
        // 非文本变更的操作不处理
        if (!isTextDeltaOp(op)) continue;
        const delta = new Delta(op.o);
        start = delta.transformPosition(start);
        end = entry.len ? delta.transformPosition(end) : start;
        isAppliedDelta = true;
      }
      if (isAppliedDelta) {
        const text = Entry.create(entry.id, POINT_TYPE.TEXT, start, end - start);
        newEntries.push(text);
        continue;
      }
    }
    // 处理块级选区 Entry
    newEntries.push(entry);
  }
  // 全部删除的情况下, 选区尝试设置到第一个插入的节点位置
  if (newEntries.length === 0 && inserts.size > 0) {
    const firstInsertId = inserts.values().next().value;
    const entry = Entry.create(firstInsertId!, POINT_TYPE.TEXT, 0, 0);
    newEntries.push(entry);
  }
  return new Range(newEntries);
};
