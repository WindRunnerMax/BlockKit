import { Delta } from "@block-kit/delta";
import { isDOMText, ROOT_BLOCK } from "@block-kit/utils";

import { Editor } from "../../src/editor";
import { LOG_LEVEL } from "../../src/log";
import { ZERO_SYMBOL } from "../../src/model/types";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";
import { toDOMRange } from "../../src/selection/utils/native";
import {
  createBlockDOM,
  createContainerDOM,
  createEditorModel,
  createEnterDOM,
  createLeafDOM,
  createLineDOM,
  createTextDOM,
} from "../config/dom";

describe("selection dom", () => {
  const delta = new Delta({
    ops: [
      { insert: "text" },
      { insert: "bold", attributes: { bold: "true" } },
      { insert: "\n" },
      { insert: "text2" },
      { insert: "bold2", attributes: { bold: "true" } },
      { insert: "\n" },
    ],
  });
  const editor = new Editor({ delta, logLevel: LOG_LEVEL.INFO });

  beforeAll(() => {
    const line1 = createLineDOM([
      createLeafDOM(createTextDOM("text")),
      createLeafDOM(createTextDOM("bold")),
      createLeafDOM(createEnterDOM()),
    ]);
    const line2 = createLineDOM([
      createLeafDOM(createTextDOM("text2")),
      createLeafDOM(createTextDOM("bold2")),
      createLeafDOM(createEnterDOM()),
    ]);
    const block = createBlockDOM(ROOT_BLOCK, [line1, line2]);
    const container = createContainerDOM([block]);
    editor.mount(container as HTMLDivElement);
    createEditorModel(editor, container as HTMLDivElement);
  });

  it("range to dom", () => {
    const range = new Range(new Point(0, 5), new Point(1, 2));
    const sel = toDOMRange(editor, range) as StaticRange;
    expect(sel).not.toBe(null);
    const { startContainer, startOffset, endContainer, endOffset } = sel;
    expect(sel.toString()).toBe(`old${ZERO_SYMBOL}te`);
    expect(isDOMText(startContainer) && isDOMText(endContainer)).toBe(true);
    expect(startContainer.textContent).toBe("bold");
    expect(startOffset).toBe(1);
    expect(endContainer.textContent).toBe("text2");
    expect(endOffset).toBe(2);
  });

  it("triple click", () => {
    const range = Range.fromTuple([1, 0], [1, 0]);
    editor.selection.set(range, true);
    const dom = editor.getContainer();
    dom.dispatchEvent(new MouseEvent("mousedown", { detail: 3 }));
    expect(editor.selection.get()).toEqual(Range.fromTuple([1, 0], [1, 10]));
  });
});
