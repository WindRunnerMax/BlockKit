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

/**
 * 获取基础的文本编辑器插件
 * @param instance
 */
export const getBasicTextEditorPlugins = (instance: TextEditor): EditorPlugin[] => [
  new BoldPlugin(),
  new ItalicPlugin(),
  new UnderlinePlugin(instance),
  new StrikePlugin(instance),
  new InlineCodePlugin(instance),
  new FontSizePlugin(instance),
  new FontColorPlugin(instance),
  new BackgroundPlugin(instance),
  new LinkPlugin(instance),
];

/**
 * 创建文本编辑器
 * @param context
 * @param options
 */
export const createComplexTextEditor = (
  context: CreateTextEditorContext,
  options?: {
    registerHook?: (editor: TextEditor) => EditorPlugin[];
  }
): TextEditor => {
  const { registerHook = () => getBasicTextEditorPlugins(instance) } = options || {};
  const block = context.state.container.editor;
  const instance = new TextEditor({
    delta: context.delta,
    schema: block.schema.textSchema,
  });
  instance.plugin.register(registerHook(instance));
  return instance;
};
