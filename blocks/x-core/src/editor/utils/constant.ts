import { getId } from "@block-kit/utils";
import type { Blocks } from "@block-kit/x-json";

export const getInitialBlocks = (): Blocks => {
  const rootId = getId();
  const textChildId = getId();
  return {
    [rootId]: {
      id: rootId,
      data: { type: "ROOT", parent: "", children: [textChildId] },
      version: 1,
    },
    [textChildId]: {
      id: getId(),
      version: 1,
      data: { type: "text", parent: rootId, children: [], delta: [] },
    },
  };
};
