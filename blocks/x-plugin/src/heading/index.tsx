import "./styles/index.scss";

import type { BlockDataType } from "@block-kit/x-json";
import type { ReactTextWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { HEADING_KEY } from "./types/index";

export class HeadingXPlugin extends BlockXPlugin {
  public key: string = HEADING_KEY;

  public destroy(): void {}

  public renderTextWrap(context: ReactTextWrapContext): React.ReactNode {
    const data = context.state.data as BlockDataType<typeof HEADING_KEY>;
    return <div className={`block-kit-x-heading-${data.level}`}>{context.children}</div>;
  }
}
