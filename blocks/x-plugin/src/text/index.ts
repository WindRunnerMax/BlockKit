import type { CreateTextEditorContext } from "@block-kit/x-core";
import type { TextEditor } from "@block-kit/x-core";
import { BlockXPlugin } from "@block-kit/x-react";

import { createComplexTextEditor } from "../shared/utils/text";
import { TEXT_KEY } from "./types";

export class TextXPlugin extends BlockXPlugin {
  public key: string = TEXT_KEY;

  public destroy(): void {}

  public willCreateTextEditor(context: CreateTextEditorContext): TextEditor {
    return createComplexTextEditor(context);
  }
}
