import type { Editor, LeafState } from "@block-kit/core";
import { LEAF_KEY } from "@block-kit/core";
import type { FC } from "react";
import React from "react";

import { ZeroSpace } from "../preset/zero";
import { LEAF_TO_ZERO_TEXT } from "../utils/weak-map";

const EOLView: FC<{
  editor: Editor;
  leafState: LeafState;
}> = props => {
  const { editor, leafState } = props;

  const setModel = (ref: HTMLSpanElement | null) => {
    if (ref) {
      editor.model.setLeafModel(ref, leafState);
    }
  };

  return (
    <span {...{ [LEAF_KEY]: true }} ref={setModel}>
      <ZeroSpace enter={true} onRef={el => el && LEAF_TO_ZERO_TEXT.set(leafState, el)} />
    </span>
  );
};

/** EOL Model */
export const EOLModel = React.memo(EOLView);
