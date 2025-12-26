import "../styles/quote.scss";

import type { BlockEditor, BlockState } from "@block-kit/x-core";
import { BlockModel } from "@block-kit/x-react";
import type { FC } from "react";

export const QuoteView: FC<{
  editor: BlockEditor;
  state: BlockState;
}> = props => {
  return (
    <div className="block-kit-x-quote">
      <BlockModel editor={props.editor} state={props.state} />
    </div>
  );
};
