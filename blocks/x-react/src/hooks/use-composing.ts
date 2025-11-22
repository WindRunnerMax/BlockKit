import { EDITOR_EVENT } from "@block-kit/core";
import type { BlockEditor } from "@block-kit/x-core";
import { useEffect, useState } from "react";

export const useComposing = (editor: BlockEditor) => {
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    const onCompositionStart = () => setIsComposing(true);
    const onCompositionEnd = () => setIsComposing(false);
    editor.event.on(EDITOR_EVENT.COMPOSITION_START, onCompositionStart);
    editor.event.on(EDITOR_EVENT.COMPOSITION_END, onCompositionEnd);
    return () => {
      editor.event.off(EDITOR_EVENT.COMPOSITION_START, onCompositionStart);
      editor.event.off(EDITOR_EVENT.COMPOSITION_END, onCompositionEnd);
    };
  }, [editor]);

  return { isComposing };
};
