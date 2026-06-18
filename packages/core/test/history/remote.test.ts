import { Delta } from "@block-kit/delta";
import { sleep } from "@block-kit/utils";

import { APPLY_SOURCE, Editor } from "../../src";

describe("history remote", () => {
  it("image upload", async () => {
    const editor = new Editor();
    // @ts-expect-error protected readonly property
    editor.history.DELAY = 10;
    editor.state.apply(new Delta().insert(" ", { src: "blob" }));
    await sleep(20);
    editor.state.apply(new Delta().retain(1, { src: "http" }), { source: APPLY_SOURCE.REMOTE });
    // @ts-expect-error protected readonly property
    const undoStack = editor.history.undoStack.map(it => it.delta);
    expect(undoStack.length).toEqual(1);
    expect(undoStack[0]).toEqual(new Delta().delete(1));
  });

  it("remote op index", async () => {
    const editor = new Editor({
      delta: new Delta().insert("000000"),
    });
    // @ts-expect-error protected readonly property
    editor.history.DELAY = 0;
    // @ts-expect-error protected readonly property
    const undoStack = editor.history.undoStack;
    editor.state.apply(new Delta().retain(3).insert("1"));
    editor.state.apply(new Delta().retain(3).insert("2"));
    expect(undoStack.map(it => it.delta.ops)).toEqual([
      [{ retain: 3 }, { delete: 1 }],
      [{ retain: 3 }, { delete: 1 }],
    ]);
    editor.state.apply(new Delta().retain(4).insert("3"), { undoable: false });
    expect(undoStack.map(it => it.delta.ops)).toEqual([
      [{ retain: 4 }, { delete: 1 }],
      [{ retain: 3 }, { delete: 1 }],
    ]);
  });
});
