import type { BlockEditor } from "@block-kit/x-core";
import React, { createContext } from "react";

export const BlockKitContext = createContext<BlockEditor | null>(null);
BlockKitContext.displayName = "BlockKitX";

export const useEditorStatic = () => {
  const editor = React.useContext(BlockKitContext);

  if (!editor) {
    throw new Error("UseEditor must be used within a EditorContext");
  }

  return { editor };
};
