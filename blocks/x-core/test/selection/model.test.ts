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
Quote3
  Quote4
    Text8
    Text9
Text10
Text11
*/

const getBlocks = (): Blocks => ({
  Root: {
    id: "Root",
    version: 1,
    data: {
      type: "ROOT",
      children: ["Text1", "Text2", "Quote1", "Quote2", "Text7", "Quote3", "Text10", "Text11"],
      parent: "",
    },
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
  Quote3: {
    id: "Quote3",
    version: 1,
    data: { type: "quote" as P.Any, children: ["Quote4"], parent: "Root" },
  },
  Quote4: {
    id: "Quote4",
    version: 1,
    data: { type: "quote" as P.Any, children: ["Text8", "Text9"], parent: "Quote3" },
  },
  Text8: {
    id: "Text8",
    version: 1,
    data: { type: "text", children: [], delta: [], parent: "Quote3" },
  },
  Text9: {
    id: "Text9",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "xx" }], parent: "Quote3" },
  },
  Text10: {
    id: "Text10",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "xx" }], parent: "Root" },
  },
  Text11: {
    id: "Text11",
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

  it("cross start block model", () => {
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

  it("cross inside start block model", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text8", type: "T", offset: 0 },
      { id: "Text10", type: "T", offset: 0 }
    );
    expect(ranges).toEqual([
      { id: "Quote3", type: "B" },
      { id: "Text10", type: "T", start: 0, len: 0 },
    ]);
  });

  it("cross end block model", () => {
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

  it("cross start-end block model", () => {
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

  it("common block level nodes", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text5", type: "B" },
      { id: "Text10", type: "B" }
    );
    expect(ranges).toEqual([
      { id: "Quote2", type: "B" },
      { id: "Text7", type: "B" },
      { id: "Quote3", type: "B" },
      { id: "Text10", type: "B" },
    ]);
  });

  it("common text block parent", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text1", type: "T", offset: 2 },
      { id: "GrandText1", type: "T", offset: 3 }
    );
    expect(ranges).toEqual([
      { id: "Text1", type: "T", start: 2, len: 3 },
      { id: "GrandText1", type: "T", start: 0, len: 3 },
    ]);
  });

  it("mixin block and text", () => {
    const editor = new BlockEditor({ initial: getBlocks() });
    const ranges = normalizeModelRange(
      editor,
      { id: "Quote3", type: "B" },
      { id: "Text11", type: "T", offset: 1 }
    );
    expect(ranges).toEqual([
      { id: "Quote3", type: "B" },
      { id: "Text10", type: "T", start: 0, len: 2 },
      { id: "Text11", type: "T", start: 0, len: 1 },
    ]);
  });
});
