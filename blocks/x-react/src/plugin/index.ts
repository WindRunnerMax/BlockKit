import { CorePlugin } from "@block-kit/x-core";

import type { ReactBlockContext, ReactBlockWrapContext, ReactTextWrapContext } from "./types";

export abstract class BlockXPlugin extends CorePlugin {
  public renderBlock?(context: ReactBlockContext): React.ReactNode;
  public renderTextWrap?(context: ReactTextWrapContext): React.ReactNode;
  public renderBlockWrap?(context: ReactBlockWrapContext): React.ReactNode;
}
