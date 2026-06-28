import { Priority } from "@block-kit/react";
import type { CreateTextEditorContext } from "@block-kit/x-core";
import type { TextEditor } from "@block-kit/x-core";
import { BlockXPlugin } from "@block-kit/x-react";
import type { ReactNode } from "react";

import type { NavigatorResult } from "../navigator/types";
import { TextIcon } from "../shared/icons/text";
import { createComplexTextEditor } from "../shared/utils/text";
import type { RenderToolbarContext } from "../toolbar/utils/schedule";
import { TextTools } from "./modules/tool-basic";
import type { TextXPluginOptions } from "./types";
import { TEXT_KEY } from "./types";

export class TextXPlugin extends BlockXPlugin {
  public key: string = TEXT_KEY;

  public constructor(public options: TextXPluginOptions = {}) {
    super();
  }

  public destroy(): void {}

  public willCreateTextEditor(context: CreateTextEditorContext): TextEditor {
    return createComplexTextEditor(context);
  }

  public renderToolbar(context: RenderToolbarContext): ReactNode {
    return <TextTools key={this.key} context={context} filterXSS={this.options.filterXSS} />;
  }

  @Priority(99999)
  public renderNavigator(): NavigatorResult {
    return {
      icon: () => ({ el: <TextIcon /> }),
    };
  }
}
