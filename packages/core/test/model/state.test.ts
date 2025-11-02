import { Delta } from "@block-kit/delta";

import { Editor } from "../../src/editor";
import { mountEditorViewModel } from "../config/view";

describe("model state", () => {
  it("line dom reuse - leaf change", () => {
    const delta = new Delta().insert("text").insertEOL();
    const editor = new Editor({ delta });
    const { lineDOMs } = mountEditorViewModel(editor);
    const line = editor.state.block.getLine(0);
    editor.state.apply(new Delta().retain(2).insert("1"));
    const newLine = editor.state.block.getLine(0);
    expect(line).not.toBe(newLine);
    expect(lineDOMs[0]).toBe(editor.model.getLineNode(newLine!));
  });

  it("leaf key reuse - merge tail", () => {
    const delta = new Delta().insert("te").insert("xt", { bold: "true" }).insertEOL();
    const editor = new Editor({ delta });
    const { leafDOMs } = mountEditorViewModel(editor);
    const line0 = editor.state.block.getLine(0);
    const leaf0 = line0!.getLeaf(0);
    const leaf2 = line0!.getLeaf(2);
    editor.state.apply(new Delta().retain(2).retain(2, { bold: "" }));
    const newLine0 = editor.state.block.getLine(0);
    const newLeaf0 = newLine0!.getLeaf(0);
    const newLeaf1 = newLine0!.getLeaf(1);
    expect(newLeaf1).toBe(leaf2);
    expect(newLeaf0).not.toBe(leaf0);
    expect(newLeaf0?.getText()).toBe("text");
    expect(leafDOMs[0][0]).toBe(newLeaf0!.getDOMNode());
  });
});
