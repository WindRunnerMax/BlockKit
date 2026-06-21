import { Priority } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";
import type { ReactNode } from "react";

import { NavMenu } from "./components/nav-menu";
import { NAVIGATOR_KEY } from "./types";

export class NavigatorXPlugin extends BlockXPlugin {
  public key: string = NAVIGATOR_KEY;
  public destroy(): void {}

  @Priority(9999999)
  public renderBlockWrap(context: ReactBlockWrapContext): ReactNode {
    return <NavMenu context={context}>{context.children}</NavMenu>;
  }
}
