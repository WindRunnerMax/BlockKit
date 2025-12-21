import "./index.scss";

import { hasOwnProperty } from "@block-kit/utils";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockPlugin } from "@block-kit/x-react";

import { ALIGN_KEY } from "./types";

export class AlignXPlugin extends BlockPlugin {
  public key: string = ALIGN_KEY;

  public destroy(): void {}

  public renderWrap(context: ReactBlockContext): React.ReactNode {
    const data = context.blockState.data;
    if (hasOwnProperty(data, "align")) {
      context.classList.push(`block-kit-x-align-${data.align}`);
    }
    return context.children;
  }
}
