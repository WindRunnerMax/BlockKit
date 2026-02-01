import type { Editor } from "@block-kit/core";
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
import type { CreateTextEditorContext } from "@block-kit/x-core";
import { TextEditor } from "@block-kit/x-core";
import { BlockXPlugin } from "@block-kit/x-react";

import { TEXT_KEY } from "./types";

export class TextXPlugin extends BlockXPlugin {
  public key: string = TEXT_KEY;

  public destroy(): void {}

  public willCreateTextEditor(context: CreateTextEditorContext): Editor {
    const instance = new TextEditor({
      delta: context.delta,
      schema: this.editor.schema.textSchema,
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
    ]);
    return instance;
  }
}
