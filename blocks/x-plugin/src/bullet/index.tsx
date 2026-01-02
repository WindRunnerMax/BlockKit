import "./styles/index.scss";

import type { ReactBlockContext, ReactBlockWrapContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { BULLET_KEY } from "./types/index";

export class BulletXPlugin extends BlockXPlugin {
  public key: string = BULLET_KEY;

  public destroy(): void {}

  public renderTextWrap(context: ReactBlockWrapContext): React.ReactNode {
    const state = context.state;
    if (state.type !== BULLET_KEY) return context.children;
    const level = state.linear;
    const dot = ["●", "◯", "■"][(level - 1) % 3];
    return (
      <div className="block-kit-x-bullet">
        <div className="block-kit-x-bullet-marker" contentEditable={false}>
          {dot}
        </div>
        {context.children}
      </div>
    );
  }

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    context.childClsList.push("block-kit-x-bullet-children");
    return context.children;
  }
}
