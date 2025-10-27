import type { JSONOp } from "../../src";
import { json } from "../../src";
import { normalizeBatchOps } from "../../src/utils/transform";

describe("transform list", () => {
  it("list insert", () => {
    const snapshot = [0];
    const ops: JSONOp[] = [
      { p: [1], li: 1 },
      { p: [1], li: 2 },
      { p: [1], li: 3 },
      { p: [1], li: 3 },
    ];
    const batch = normalizeBatchOps(ops);
    const next = json.apply(snapshot, batch);
    expect(batch[0]).toEqual({ p: [1], li: 1 });
    expect(batch[1]).toEqual({ p: [2], li: 2 });
    expect(batch[2]).toEqual({ p: [3], li: 3 });
    expect(batch[3]).toEqual({ p: [4], li: 3 });
    expect(next).toEqual([0, 1, 2, 3, 3]);
  });

  it("list delete", () => {
    const snapshot = [0, 1, 2, 3, 3];
    const ops: JSONOp[] = [
      { p: [1], ld: 1 },
      { p: [2], ld: 2 },
      { p: [3], ld: 3 },
      { p: [4], ld: 3 },
    ];
    const batch = normalizeBatchOps(ops);
    const next = json.apply(snapshot, batch);
    expect(batch[0]).toEqual({ p: [1], ld: 1 });
    expect(batch[1]).toEqual({ p: [1], ld: 2 });
    expect(batch[2]).toEqual({ p: [1], ld: 3 });
    expect(batch[3]).toEqual({ p: [1], ld: 3 });
    expect(next).toEqual([0]);
  });

  it("list delete rand pos", () => {
    const snapshot = [0, 1, 2, 3, 3];
    const ops: JSONOp[] = [
      { p: [1], ld: 1 },
      { p: [4], ld: 3 },
      { p: [2], ld: 2 },
      { p: [3], ld: 3 },
    ];
    const batch = normalizeBatchOps(ops);
    const next = json.apply(snapshot, batch);
    expect(batch[0]).toEqual({ p: [1], ld: 1 });
    expect(batch[1]).toEqual({ p: [3], ld: 3 });
    expect(batch[2]).toEqual({ p: [1], ld: 2 });
    expect(batch[3]).toEqual({ p: [1], ld: 3 });
    expect(next).toEqual([0]);
  });

  it("list insert and delete", () => {
    const snapshot = [0, 1, 2, 3, 4, 5];
    const ops: JSONOp[] = [
      { p: [2], li: 4 },
      { p: [3], li: 5 },
      { p: [1], ld: 1 },
      { p: [2], ld: 2 },
    ];
    const batch = normalizeBatchOps(ops);
    const next = json.apply(snapshot, batch);
    expect(batch[0]).toEqual({ p: [2], li: 4 });
    expect(batch[1]).toEqual({ p: [4], li: 5 });
    expect(batch[2]).toEqual({ p: [1], ld: 1 });
    expect(batch[3]).toEqual({ p: [2], ld: 2 });
    expect(next).toEqual([0, 4, 5, 3, 4, 5]);
  });
});
