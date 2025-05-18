import type { LineState } from "@block-kit/core";
import { isEOLOp } from "@block-kit/delta";

export const isEmptyLine = (line: LineState) => {
  const lastLeaf = line.getLastLeaf();
  const leaves = line.getLeaves();
  // 没有最后的叶子结点, 或者仅单个节点且最后的叶子结点是换行符
  return !lastLeaf || (leaves.length === 1 && isEOLOp(lastLeaf.op));
};

export const isKeyCode = (event: KeyboardEvent, code: number) => {
  return event.keyCode === code;
};
