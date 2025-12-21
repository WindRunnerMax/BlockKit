import { Editor } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { sleep } from "@block-kit/utils";
import { useForceUpdate } from "@block-kit/utils/dist/es/hooks";
import type { F, P } from "@block-kit/utils/dist/es/types";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import { BlockKit, Editable } from "../../src";

describe("render effect", () => {
  it("paint effect render penetrate memo", async () => {
    const delta = new Delta().insertEOL();
    const editor = new Editor({ delta });
    let forceUpdate: F.Plain = () => null;
    const App = () => {
      const uses = useForceUpdate();
      forceUpdate = uses.forceUpdate;
      return (
        <BlockKit editor={editor}>
          <Editable placeholder={<div></div>}></Editable>
        </BlockKit>
      );
    };
    render(<App />);
    const spy = jest.fn();
    await sleep(20);
    await act(() => {
      forceUpdate();
      editor.event.on("PAINT", spy);
      return sleep(20) as P.Any;
    });
    expect(spy).toBeCalledTimes(0);
  });
});
