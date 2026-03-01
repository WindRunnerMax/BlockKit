import { BlockXPlugin } from "@block-kit/x-react";

import { TOOLBAR_KEY } from "./types/index";

export class ToolbarXPlugin extends BlockXPlugin {
  public key: string = TOOLBAR_KEY;

  public destroy(): void {}
}
