import "./styles/index.scss";

import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockPlugin } from "@block-kit/x-react";

import { QUOTE_KEY } from "./types/index";

export class QuoteXPlugin extends BlockPlugin {
  public key: string = QUOTE_KEY;

  public destroy(): void {}

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    const state = context.state;
    if (process.env.NODE_ENV === "development") {
      if ("delta" in state.data) {
        console.warn("Quote Block should not have delta field.");
      }
    }
    context.classList.push("block-kit-x-quote");
    return context.children;
  }
}
