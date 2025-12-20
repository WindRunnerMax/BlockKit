import type { Op } from "@block-kit/ot-json";

import type { DeltaSubOp } from "../modules/subtype";
import type { BlocksChange } from "../types/block";

export const isTextDeltaOp = (op: Op): op is DeltaSubOp => {
  return op.p[0] === "delta" && op.t === "delta" && op.o;
};

export const isEmptyChanges = (changes: BlocksChange) => {
  return Object.keys(changes).length === 0;
};
