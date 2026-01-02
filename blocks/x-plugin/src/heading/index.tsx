import "./styles/index.scss";

import type { BlockDataType } from "@block-kit/x-json";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { HEADING_KEY } from "./types/index";

export class HeadingXPlugin extends BlockXPlugin {
  public key: string = HEADING_KEY;

  public destroy(): void {}

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    const data = context.state.data as BlockDataType<typeof HEADING_KEY>;
    context.classList.push(`block-kit-x-heading-${data.level}`);
    return context.children;
  }
}
