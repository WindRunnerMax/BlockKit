import "../styles/quote.scss";

import type { BlockEditor, BlockState } from "@block-kit/x-core";
import { BlockModel } from "@block-kit/x-react";
import type { FC } from "react";

export const QuoteView: FC<{
  editor: BlockEditor;
  state: BlockState;
}> = props => {
  return <BlockModel className="block-kit-x-quote" editor={props.editor} state={props.state} />;
};
