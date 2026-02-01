import type { CreateTextEditorContext } from "@block-kit/x-core";
import type { TextEditor } from "@block-kit/x-core";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { createComplexTextEditor } from "../shared/utils/text";
import { CODE_KEY } from "./types";
import { CodeHLPlugin } from "./utils/hl-plugin";
import { CodeBlock } from "./view/code-block";

export class CodeXPlugin extends BlockXPlugin {
  public key: string = CODE_KEY;

  public destroy(): void {}

  public willCreateTextEditor(context: CreateTextEditorContext): TextEditor {
    return createComplexTextEditor(context, {
      registerHook: () => [new CodeHLPlugin()],
    });
  }

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    return <CodeBlock editor={this.editor} context={context}></CodeBlock>;
  }
}
