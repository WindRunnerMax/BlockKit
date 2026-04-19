import { BlockXPlugin } from "@block-kit/x-react";

import { NAVIGATOR_KEY } from "./types";

export class NavigatorXPlugin extends BlockXPlugin {
  public key: string = NAVIGATOR_KEY;
  public destroy(): void {}
}
