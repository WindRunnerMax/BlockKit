import { Editor } from "@block-kit/core";
import { CorePlugin } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { sleep } from "@block-kit/utils";
import { useForceUpdate } from "@block-kit/utils/dist/es/hooks";
import type { F, P } from "@block-kit/utils/dist/es/types";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import { BlockKit, Editable } from "../../src";

// UpdateDOMSelection/OnPaint [假设 ph 的状态管理在父组件上]
// 父组件渲染会引发子组件渲染问题, memo 并未严格控制对比, 例如 ph 变更会导致重渲染
// 没有严格控制对比, 而 ph 组件每次更新都是会创建新对象, 需要避免 memo 的渲染穿透问题
// 相关事件节点将依赖即 [lines] 作为以来放置于 effect 中, 能够避免父组件的重渲染问题
// 此外独立出 Hook 更合理, 独立组件实现方式需要保证组件渲染顺序, 否则会导致选区刷新问题
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

  it("paint effect render placeholder composing state", async () => {
    const delta = new Delta().insertEOL();
    const editor = new Editor({ delta });
    const App = () => {
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
      editor.event.on("PAINT", spy);
      // Placeholder 作为子组件重新渲染, 不会触发父节点的 PAINT(effect) 事件
      editor.event.trigger("compositionstart", new Event("compositionstart") as CompositionEvent);
      editor.event.trigger("compositionend", new Event("compositionend") as CompositionEvent);
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
