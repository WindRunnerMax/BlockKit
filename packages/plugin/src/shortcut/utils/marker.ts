import type { Editor, Range } from "@block-kit/core";

/** 行首标记匹配结果 */
export type LineMarkerMatch = {
  /** 匹配到的行首标记, 例如 `-` / `1.` / `#` */
  marker: string;
};

/**
 * 匹配行首标记
 * 匹配范围限定在首叶子节点的文本上, 以降低判断范围:
 * - 首叶子节点必须从行首开始, 且以标记开头
 * - 选区必须折叠, 且光标紧邻标记之后, 即光标之前恰好是行首标记
 * @param editor 编辑器实例
 * @param sel 当前选区
 * @param markers 候选标记, 存在前缀重叠时优先匹配更长的标记
 * @returns 匹配结果, 未命中时返回 null
 */
export const matchLineMarker = (
  editor: Editor,
  sel: Range,
  markers: string[]
): LineMarkerMatch | null => {
  if (!sel.isCollapsed) return null;
  const line = editor.state.block.getLine(sel.start.line);
  const firstLeaf = line && line.getFirstLeaf();
  const text = firstLeaf && firstLeaf.getText();
  if (!firstLeaf || !text) return null;
  // 首叶子节点必须从行首开始, 否则行首不是纯文本
  const isLineStart = !firstLeaf.prev();
  if (!isLineStart) return null;
  // 光标之前的文本, 光标之后的内容不参与判断, 因此 `-内容` 也能够在敲空格时触发
  const beforeCaret = text.slice(0, sel.start.offset);
  const candidates = [...markers].sort((a, b) => b.length - a.length);
  for (const marker of candidates) {
    if (beforeCaret !== marker) continue;
    return { marker };
  }
  return null;
};
