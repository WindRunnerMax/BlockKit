import type { BlockEditor } from "@block-kit/x-core";
import type { Range } from "@block-kit/x-core";
import React from "react";

export type ToolbarContextType = {
  editor: BlockEditor;
  refreshMarks: () => void;
  keys: Record<string, string>;
  setKeys: (v: Record<string, string>) => void;
  selection: Range | null;
};

export const ToolbarContext = React.createContext<ToolbarContextType>({
  keys: {},
  setKeys: () => null,
  refreshMarks: () => null,
  editor: null as unknown as BlockEditor,
  selection: null,
});
ToolbarContext.displayName = "Toolbar";

export const useToolbarContext = () => React.useContext(ToolbarContext);
