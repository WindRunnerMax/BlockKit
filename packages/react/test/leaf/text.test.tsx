import { Editor } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import { BlockKit, Editable, LEAF_TO_TEXT } from "../../src";
import { waitRenderComplete } from "../config/utils";

describe("leaf text", () => {
  it("leaf-to-text reference callback", async () => {
    const delta = new Delta()
      .insert("text")
      .insert("aaa", { a: "true" })
      .insert("b", { a: "true", b: "true" })
      .insertEOL();
    const editor = new Editor({ delta });
    render(
      <BlockKit editor={editor}>
        <Editable></Editable>
      </BlockKit>
    );
    const leaf1 = editor.state.block.getLine(0)!.getLeaf(0)!;
    await act(() => {
      editor.state.apply(new Delta().retain(2).retain(1, { a: "true" }));
      return waitRenderComplete(editor, 10);
    });
    const leaf2 = editor.state.block.getLine(0)!.getLeaf(0)!;
    expect(leaf1).not.toBe(leaf2);
    expect(LEAF_TO_TEXT.get(leaf2)?.textContent).toBe("te");
  });

  it("leaf state retain keep ref", async () => {
    const delta = new Delta()
      .insert("text")
      .insert("aaa", { a: "true" })
      .insert("b", { a: "true", b: "true" })
      .insertEOL();
    const editor = new Editor({ delta });
    render(
      <BlockKit editor={editor}>
        <Editable></Editable>
      </BlockKit>
    );
    const leaf1 = editor.state.block.getLine(0)!.getLeaf(1)!;
    await act(() => {
      editor.state.apply(new Delta().retain(4).retain(3, { a: "true" }));
      return waitRenderComplete(editor, 10);
    });
    const leaf2 = editor.state.block.getLine(0)!.getLeaf(1)!;
    expect(leaf1.op).toEqual(leaf2.op);
    expect(leaf1).toBe(leaf2);
  });
});
