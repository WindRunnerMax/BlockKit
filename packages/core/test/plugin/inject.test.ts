import { CorePlugin, Editor } from "../../src/index";

describe("plugin inject", () => {
  class Plugin extends CorePlugin {
    public key = "plugin";
    public destroy(): void {}
    public match = () => true;
  }

  it("multi editor instance", () => {
    const editor1 = new Editor();
    const editor2 = new Editor();
    editor1.plugin.register([new Plugin()]);
    editor2.plugin.register([new Plugin()]);
    expect(CorePlugin.editor).toBeNull();
    // @ts-expect-error editor
    const pluginEditor1 = editor1.plugin.current[0].editor;
    // @ts-expect-error editor
    const pluginEditor2 = editor2.plugin.current[0].editor;
    expect(pluginEditor1).toBe(editor1);
    expect(pluginEditor2).toBe(editor2);
    expect(pluginEditor1).not.toBe(pluginEditor2);
  });

  it("prevent inject editor", () => {
    class Plugin2 extends CorePlugin {
      public static preventInjectEditorError = true;
      public key = "plugin";
      public destroy(): void {}
      public match = () => true;
    }
    expect(() => new Plugin2()).not.toThrowError();
  });
});
