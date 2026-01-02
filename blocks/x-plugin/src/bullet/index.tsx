import type { ReactBlockContext, ReactBlockWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { BULLET_KEY } from "./types/index";
import { BulletText } from "./view/bullet";

export class BulletXPlugin extends BlockXPlugin {
  public key: string = BULLET_KEY;

  public destroy(): void {}

  public renderTextWrap(context: ReactBlockWrapContext): React.ReactNode {
    const state = context.state;
    if (state.type !== BULLET_KEY) return context.children;
    return <BulletText context={context}>{context.children}</BulletText>;
  }

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    context.childClsList.push("block-kit-x-bullet-children");
    return context.children;
  }
}
