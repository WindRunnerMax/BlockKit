/**
 * @jest-environment node
 */
import { Editor } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { renderToString } from "react-dom/server";

import { BlockKit, Editable } from "../../src";

describe("node ssr", () => {
  it("dom env preflight", () => {
    expect(() => window).toThrowError();
    expect(() => document).toThrowError();
    expect(() => navigator).toThrowError();
  });

  it("ssr dom string", () => {
    const delta = new Delta().insert("test").insertEOL();
    const editor = new Editor({ delta });
    const string = renderToString(
      <BlockKit editor={editor}>
        <Editable></Editable>
      </BlockKit>
    );
    expect(string).toContain(
      '<div data-block="true" data-block-id="ROOT"><div data-node="true" dir="auto"><span data-leaf="true"><span data-string="true">test</span></span></div></div>'
    );
  });
});
