import { Priority } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";
import type { ReactNode } from "react";

import { NavTrigger } from "./components/nav-trigger";
import { NAVIGATOR_KEY } from "./types";

export class NavigatorXPlugin extends BlockXPlugin {
  public key: string = NAVIGATOR_KEY;
  public destroy(): void {}

  @Priority(9999999)
  public renderBlockWrap(context: ReactBlockWrapContext): ReactNode {
    return (
      <NavTrigger editor={this.editor} context={context}>
        {context.children}
      </NavTrigger>
    );
  }
}
