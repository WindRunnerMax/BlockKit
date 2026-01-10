import { Editor } from "@block-kit/core";
import { CorePlugin } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { sleep } from "@block-kit/utils";
import { useForceUpdate } from "@block-kit/utils/dist/es/hooks";
import type { F, P } from "@block-kit/utils/dist/es/types";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import { BlockKit, Editable } from "../../src";

describe("render effect", () => {
  it("paint effect render placeholder penetrate memo", async () => {
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

  it("paint layout effect render execution timing", async () => {
    const delta = new Delta().insertEOL();
    const editor = new Editor({ delta });
    const timing: string[] = [];
    editor.logger.debug = (k: string) => {
      if (k === "OnPaint") timing.push("OnPaint");
    };
    class Test extends CorePlugin {
      public key: string = "P";
      public destroy(): void {}
      public match(): boolean {
        return false;
      }
      public didPaintLineState(): void {
        timing.push("PaintLine");
      }
    }
    editor.plugin.register([new Test()]);
    const App = () => {
      return (
        <BlockKit editor={editor}>
          <Editable></Editable>
        </BlockKit>
      );
    };
    render(<App />);
    await sleep(20);
    await act(() => {
      const change = new Delta().insert("1");
      editor.state.apply(change);
      return sleep(20) as P.Any;
    });
    expect(timing).toEqual(["OnPaint", "PaintLine", "OnPaint"]);
  });
});
