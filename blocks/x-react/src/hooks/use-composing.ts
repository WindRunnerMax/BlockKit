import { EDITOR_EVENT } from "@block-kit/core";
import type { BlockEditor } from "@block-kit/x-core";
import { useEffect, useState } from "react";

export const useComposing = (editor: BlockEditor) => {
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    const onCompositionStart = () => setIsComposing(true);
    const onCompositionEnd = () => setIsComposing(false);
    editor.event.on(EDITOR_EVENT.COMPOSITION_START, onCompositionStart);
    // 提前执行是为了避免在 CompositionEnd 事件触发后认为仍在组合输入状态
    editor.event.on(EDITOR_EVENT.COMPOSITION_END, onCompositionEnd, 90);
    return () => {
      editor.event.off(EDITOR_EVENT.COMPOSITION_START, onCompositionStart);
      editor.event.off(EDITOR_EVENT.COMPOSITION_END, onCompositionEnd);
    };
  }, [editor]);

  return { isComposing };
};
