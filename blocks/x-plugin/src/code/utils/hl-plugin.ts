import type { ReactLeafContext, ReactLineContext } from "@block-kit/react";
import { EditorPlugin } from "@block-kit/react";
import type { ReactNode } from "react";
import { createElement } from "react";

import { CODE_HL_KEY, CODE_HL_LINE_NUM } from "./constant";

export class CodeHLPlugin extends EditorPlugin {
  public key = CODE_HL_KEY;
  public destroy(): void {}

  public match(): boolean {
    return true;
  }

  public renderLine(context: ReactLineContext): React.ReactNode {
    const index = context.lineState.index;
    return createElement(
      "div",
      {
        className: "block-x-code-hl-line",
        [CODE_HL_LINE_NUM]: index + 1,
      },
      context.children
    );
  }

  public renderLeaf(context: ReactLeafContext): ReactNode {
    if (context.attributes && context.attributes[CODE_HL_KEY]) {
      context.classList.push("token", context.attributes[CODE_HL_KEY]);
    }
    return context.children;
  }
}
