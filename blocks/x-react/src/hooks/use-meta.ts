import type { Editor } from "@block-kit/core";
import type { Delta } from "@block-kit/delta";
import React, { createContext } from "react";

export type MetaProviderProps = {
  onCreateTextEditor: (delta: Delta) => Editor;
};

export const MetaContext = createContext<MetaProviderProps | null>(null);
MetaContext.displayName = "MetaContext";

export const useMetaStatic = () => {
  const meta = React.useContext(MetaContext);

  if (!meta) {
    throw new Error("UseMeta must be used within a MetaContext");
  }

  return meta;
};
