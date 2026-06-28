import { Priority } from "@block-kit/x-core";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";
import type { ReactNode } from "react";

import { NavTrigger } from "./components/nav-trigger";
import { ClipboardNavPlugin } from "./modules/clipboard";
import type { NavigatorOptions, NavigatorPlugin } from "./types";
import { NAVIGATOR_KEY } from "./types";

export class NavigatorXPlugin extends BlockXPlugin {
  public key: string = NAVIGATOR_KEY;
  public plugins: NavigatorPlugin[];

  public constructor(protected options: NavigatorOptions = {}) {
    super();
    this.plugins = options.plugins || [ClipboardNavPlugin];
  }

  public destroy(): void {}

  @Priority(9999999)
  public renderBlockWrap(context: ReactBlockWrapContext): ReactNode {
    return (
      <NavTrigger editor={this.editor} context={context} plugins={this.plugins}>
        {context.children}
      </NavTrigger>
    );
  }
}
