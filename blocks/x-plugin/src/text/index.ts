import type { CreateTextEditorContext } from "@block-kit/x-core";
import type { TextEditor } from "@block-kit/x-core";
import { BlockXPlugin } from "@block-kit/x-react";
import type { ReactNode } from "react";

import { createComplexTextEditor } from "../shared/utils/text";
import type { RenderToolbarContext } from "../toolbar/utils/schedule";
import { renderTextToolbar } from "./modules/toolbar";
import { TEXT_KEY } from "./types";

export class TextXPlugin extends BlockXPlugin {
  public key: string = TEXT_KEY;

  public destroy(): void {}

  public willCreateTextEditor(context: CreateTextEditorContext): TextEditor {
    return createComplexTextEditor(context);
  }

  public renderToolbar(context: RenderToolbarContext): ReactNode {
    return renderTextToolbar(this.key, context);
  }
}
