import {
  BackgroundPlugin,
  BoldPlugin,
  FontColorPlugin,
  FontSizePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LinkPlugin,
  StrikePlugin,
  UnderlinePlugin,
} from "@block-kit/plugin";
import type { EditorPlugin } from "@block-kit/react";
import type { CreateTextEditorContext } from "@block-kit/x-core";
import { TextEditor } from "@block-kit/x-core";

export const createComplexTextEditor = (
  context: CreateTextEditorContext,
  options?: {
    registerHook?: (editor: TextEditor) => EditorPlugin[];
  }
): TextEditor => {
  const { registerHook = () => [] } = options || {};
  const block = context.state.container.editor;
  const instance = new TextEditor({
    delta: context.delta,
    schema: block.schema.textSchema,
  });
  instance.plugin.register([
    new BoldPlugin(),
    new ItalicPlugin(),
    new UnderlinePlugin(instance),
    new StrikePlugin(instance),
    new InlineCodePlugin(instance),
    new FontSizePlugin(instance),
    new FontColorPlugin(instance),
    new BackgroundPlugin(instance),
    new LinkPlugin(instance),
    ...registerHook(instance),
  ]);
  return instance;
};
