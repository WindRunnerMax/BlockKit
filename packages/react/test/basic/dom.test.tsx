import { Editor, LEAF_KEY, LEAF_STRING, NODE_KEY } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { render } from "@testing-library/react";

import { BlockKit, Editable } from "../../src";

// <div data-block-kit="true" contenteditable="true">
//   <div data-block="true" data-block-id="ROOT">
//     <div data-node="true" dir="auto">
//       <span data-leaf="true">
//         <span data-string="true">test</span>
//       </span>
//     </div>
//   </div>
// </div>

describe("basic dom", () => {
  it("editor", () => {
    const delta = new Delta().insert("test").insertEOL();
    const editor = new Editor({ delta });
    const dom = render(
      <BlockKit editor={editor}>
        <Editable></Editable>
      </BlockKit>
    );
    const root = dom.container;
    const lines = root.querySelectorAll(`[${NODE_KEY}]`);
    const leaves = Array.from(lines).map(line => line.querySelectorAll(`[${LEAF_KEY}]`));
    expect(lines.length).toBe(1);
    expect(leaves[0].length).toBe(1);
    expect(leaves[0][0].querySelector(`[${LEAF_STRING}]`)!.textContent).toBe("test");
  });
});
