import type { P } from "@block-kit/utils/dist/es/types";
import type { Blocks } from "@block-kit/x-json";

import { BlockEditor, normalizeModelRange } from "../../src";

/*
Text1
  GrandText1
Text2
Quote1
  Text3
  Text4
Quote2
  Text5
  Text6
Text7
*/

const getBlocks = (): Blocks => ({
  Root: {
    id: "Root",
    version: 1,
    data: { type: "ROOT", children: ["Text1", "Text2", "Quote1", "Quote2", "Text7"], parent: "" },
  },
  Text1: {
    id: "Text1",
    version: 1,
    data: {
      type: "text",
      children: ["GrandText1"],
      delta: [{ insert: "t1111" }],
      parent: "Root",
    },
  },
  GrandText1: {
    id: "GrandText1",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "xx" }], parent: "Text1" },
  },
  Text2: {
    id: "Text2",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "Root" },
  },
  Quote1: {
    id: "Quote1",
    version: 1,
    data: { type: "quote" as P.Any, children: ["Text3", "Text4"], parent: "Root" },
  },
  Text3: {
    id: "Text3",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "Quote1" },
  },
  Text4: {
    id: "Text4",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "Quote1" },
  },
  Quote2: {
    id: "Quote2",
    version: 1,
    data: { type: "quote" as P.Any, children: ["Text5", "Text6"], parent: "Root" },
  },
  Text5: {
    id: "Text5",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "Quote2" },
  },
  Text6: {
    id: "Text6",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "Quote2" },
  },
  Text7: {
    id: "Text7",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "xx" }], parent: "Root" },
  },
});

describe("selection model", () => {
  it("signal text block model", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text1", type: "T", offset: 2 },
      { id: "Text1", type: "T", offset: 3 }
    );
    expect(ranges).toEqual([{ id: "Text1", type: "T", start: 2, len: 1 }]);
  });

  it("common parent range", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text1", type: "T", offset: 2 },
      { id: "Text2", type: "T", offset: 5 }
    );
    expect(ranges).toEqual([
      { id: "Text1", type: "T", start: 2, len: 3 },
      { id: "GrandText1", type: "T", start: 0, len: 2 },
      { id: "Text2", type: "T", start: 0, len: 5 },
    ]);
  });

  it("cross pre block model", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text5", type: "T", offset: 0 },
      { id: "Text7", type: "T", offset: 0 }
    );
    expect(ranges).toEqual([
      { id: "Quote2", type: "B" },
      { id: "Text7", type: "T", start: 0, len: 0 },
    ]);
  });

  it.only("cross post block model", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "GrandText1", type: "T", offset: 0 },
      { id: "Text7", type: "T", offset: 0 }
    );
    expect(ranges).toEqual([
      { id: "GrandText1", type: "T", start: 0, len: 2 },
      { id: "Text2", type: "T", start: 0, len: 0 },
      { id: "Quote1", type: "B" },
      { id: "Quote2", type: "B" },
      { id: "Text7", type: "T", start: 0, len: 0 },
    ]);
  });

  it("cross pre-post block model", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text4", type: "T", offset: 0 },
      { id: "Text6", type: "T", offset: 0 }
    );
    expect(ranges).toEqual([
      { id: "Quote1", type: "B" },
      { id: "Quote2", type: "B" },
    ]);
  });
});
