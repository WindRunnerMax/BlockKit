import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockPlugin } from "@block-kit/x-react";

import { QuoteView } from "./component/quote";
import { QUOTE_KEY } from "./types/index";

export class QuoteXPlugin extends BlockPlugin {
  public key: string = QUOTE_KEY;

  public destroy(): void {}

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    if (process.env.NODE_ENV === "development") {
      if ("delta" in context.blockState.data) {
        console.warn("Quote Block should not have delta field.");
      }
    }
    const state = this.editor.state.getBlock(context.blockState.id)!;
    return <QuoteView key={state.id} editor={this.editor} state={state} />;
  }
}
