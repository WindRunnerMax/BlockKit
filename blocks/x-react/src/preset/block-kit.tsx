import { EDITOR_STATE } from "@block-kit/core";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactNode } from "react";

import { BlockKitContext } from "../hooks/use-editor";
import { ReadonlyContext } from "../hooks/use-readonly";
import { PortalModel } from "../model/portal";

export type BlockKitProps = {
  editor: BlockEditor;
  readonly?: boolean;
  children?: ReactNode;
};

export const BlockKitX: React.FC<BlockKitProps> = props => {
  const { editor, readonly, children } = props;

  if (editor.state.get(EDITOR_STATE.READONLY) !== readonly) {
    editor.state.set(EDITOR_STATE.READONLY, readonly || false);
  }

  return (
    <BlockKitContext.Provider value={editor}>
      <ReadonlyContext.Provider value={!!readonly}>
        <PortalModel editor={editor}></PortalModel>
        {children}
      </ReadonlyContext.Provider>
    </BlockKitContext.Provider>
  );
};
