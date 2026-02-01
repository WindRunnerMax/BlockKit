import type { AttributeMap } from "@block-kit/delta";
import type { ReactLeafContext } from "@block-kit/react";
import { EditorPlugin } from "@block-kit/react";
import type { ReactNode } from "react";

import { CODE_HL_KEY } from "./constant";

export class CodeHLPlugin extends EditorPlugin {
  public key = CODE_HL_KEY;
  public destroy(): void {}

  public match(attrs: AttributeMap): boolean {
    return !!attrs[CODE_HL_KEY];
  }

  public renderLeaf(context: ReactLeafContext): ReactNode {
    if (context.attributes && context.attributes[CODE_HL_KEY]) {
      context.classList.push("token", context.attributes[CODE_HL_KEY]);
    }
    return context.children;
  }
}
