import type { BlockState, Listener } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { useEffect, useState } from "react";

/**
 * 判断选区是否在块内
 * - 仅以选区首节点作为基础检查
 * @param state
 */
export const useFocusedInState = (state: BlockState) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const editor = state.container.editor;
    const isClosestState = (block: BlockState | null): boolean => {
      if (!block) return false;
      if (block === state) return true;
      let node: BlockState | null = block.parent;
      while (node) {
        if (node === state) return true;
        node = node.parent;
      }
      return false;
    };
    const onSelectionChange: Listener<"SELECTION_CHANGE"> = e => {
      const current = e.current;
      if (!current || current.length === 0) {
        setIsFocused(false);
        return void 0;
      }
      const first = current.at(0)!;
      const block = editor.state.getBlock(first.id);
      setIsFocused(isClosestState(block));
    };
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    };
  }, [state]);

  return { isFocused };
};
