import type { Op } from "@block-kit/ot-json";

import type { DeltaSubOp } from "../modules/subtype";

export const isTextDeltaOp = (op: Op): op is DeltaSubOp => {
  return op.p[0] === "delta" && op.t === "delta" && op.o;
};
