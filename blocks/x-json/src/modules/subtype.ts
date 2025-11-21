import type { Op } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import type { Side, Subtype } from "@block-kit/ot-json";
import type { SubtypeOp } from "@block-kit/ot-json";
import { json as ot } from "@block-kit/ot-json";
import { SIDE } from "@block-kit/ot-json";

declare module "@block-kit/ot-json/dist/es/subtype" {
  interface SubtypeOpMap {
    delta: Op[];
  }
}

export const deltaType: Subtype = {
  name: "delta",
  apply: (snapshot: Op[], delta: Op[]) => {
    const delta1 = new Delta(snapshot);
    const delta2 = new Delta(delta);
    return delta1.compose(delta2).ops;
  },
  compose: (ops1: Op[], ops2: Op[]) => {
    const delta1 = new Delta(ops1);
    const delta2 = new Delta(ops2);
    // compose("A", "B") => BA => delta2 compose delta1
    return delta2.compose(delta1).ops;
  },
  transform: (ops1: Op[], ops2: Op[], side) => {
    const delta1 = new Delta(ops1);
    const delta2 = new Delta(ops2);
    return delta2.transform(delta1, side === SIDE.LEFT).ops;
  },
  invert(ops: Op[], snapshot?: Op[]) {
    // https://github.com/share/sharedb/issues/149
    if (!snapshot) throw new Error("Snapshot is required to invert delta");
    const delta1 = new Delta(snapshot);
    const delta2 = new Delta(ops);
    return delta2.invert(delta1).ops;
  },
  transformCursor(cursor: number, ops: Op[], side?: Side) {
    const delta = new Delta(ops);
    const isOwnOp = !side || side === SIDE.LEFT;
    return delta.transformPosition(cursor, isOwnOp);
  },
};

/** JSON Delta Subtype Op */
export type DeltaSubOp = SubtypeOp<"delta">;

/** OT JSON Type */
export const json = ot.registerSubtype(deltaType);
