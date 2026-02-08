import type { Editor } from "@block-kit/core";
import React, { createContext } from "react";

export const BlockKitContext = createContext<Editor | null>(null);
BlockKitContext.displayName = "BlockKit";

export const useEditorStatic = () => {
  const editor = React.useContext(BlockKitContext);

  if (!editor) {
    throw new Error("UseEditor must be used within a EditorContext");
  }

  return { editor };
};
