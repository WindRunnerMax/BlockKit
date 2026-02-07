import type { Blocks } from "@block-kit/x-json";

import type { EditorXSchema } from "../../src";
import { BlockEditor, normalizeModelRange } from "../../src";

const schema: EditorXSchema = {
  code: { boxText: true },
};

export const getBlocks = (): Blocks => ({
  Root: {
    id: "Root",
    version: 1,
    data: {
      type: "ROOT",
      children: ["Text1", "Code", "Text2"],
      parent: "",
    },
  },
  Text1: {
    id: "Text1",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "1" }], parent: "Root" },
  },
  Code: {
    id: "Code",
    version: 1,
    // @ts-expect-error code block
    data: { type: "code", children: [], delta: [{ insert: "c" }], parent: "Root" },
  },
  Text2: {
    id: "Text2",
    version: 1,
    data: { type: "text", children: [], delta: [{ insert: "2" }], parent: "Root" },
  },
});

describe("selection box-text model", () => {
  it("box text schema start range type", () => {
    const editor = new BlockEditor({ initial: getBlocks(), schema });
    const ranges = normalizeModelRange(
      editor,
      { id: "Text1", type: "T", offset: 0 },
      { id: "Code", type: "T", offset: 1 }
    );
    expect(ranges).toEqual([
      { id: "Text1", type: "T", start: 0, len: 1 },
      { id: "Code", type: "B" },
    ]);
  });

  it("box text schema end range type", () => {
    const editor = new BlockEditor({ initial: getBlocks(), schema });
    const ranges = normalizeModelRange(
      editor,
      { id: "Code", type: "T", offset: 0 },
      { id: "Text2", type: "T", offset: 1 }
    );
    expect(ranges).toEqual([
      { id: "Code", type: "B" },
      { id: "Text2", type: "T", start: 0, len: 1 },
    ]);
  });
});
