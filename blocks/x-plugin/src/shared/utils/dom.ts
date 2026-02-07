import { relativeTo } from "@block-kit/core";
import type { BlockEditor } from "@block-kit/x-core";
import { MountNode } from "@block-kit/x-react";

/**
 * 获取编辑器挂载节点的矩形位置
 * @param editor
 * @param dom
 */
export const getMountRect = (editor: BlockEditor, dom: HTMLDivElement | null) => {
  if (!dom) {
    return { left: 0, top: 0 };
  }
  const rect = dom.getBoundingClientRect();
  let left = rect.left;
  let top = rect.top;
  const mountDOM = MountNode.get(editor);
  if (mountDOM === document.body) {
    left = left + window.scrollX;
    top = top + window.scrollY;
  } else {
    const editorRect = editor.rect.getEditorRect();
    const relativeRect = relativeTo(rect, editorRect);
    left = relativeRect.left;
    top = relativeRect.top;
  }
  return { left, top };
};
