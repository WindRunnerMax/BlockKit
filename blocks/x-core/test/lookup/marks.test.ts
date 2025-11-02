import type { Blocks } from "@block-kit/x-json";

import { BlockEditor } from "../../src";
import { getOpMetaMarks } from "../../src/lookup/utils/marks";

const getBlocks = (): Blocks => ({
  root: {
    id: "root",
    version: 1,
    data: { type: "ROOT", children: ["child1"], parent: "" },
  },
  child1: {
    id: "child1",
    version: 1,
    data: {
      type: "text",
      children: [],
      delta: [
        { insert: "text", attributes: { inline: "true" } },
        { insert: "text2", attributes: { bold: "true", inline: "true" } },
        { insert: "text3", attributes: { bold: "true" } },
      ],
      parent: "root",
    },
  },
});

describe("lookup marks", () => {
  it("collect inline mark", () => {
    const editor = new BlockEditor({
      initial: getBlocks(),
      schema: {
        bold: { mark: true },
        inline: { mark: true, inline: true },
      },
    });
    const meta = editor.lookup.getLeafAtPoint("child1", 5);
    const attributes = getOpMetaMarks(editor, meta!);
    expect(attributes).toEqual({ bold: "true", inline: "true" });
  });
});
