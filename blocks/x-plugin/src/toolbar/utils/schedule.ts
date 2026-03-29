import type { Op } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";
import { isEOLOp } from "@block-kit/delta";
import { isNil } from "@block-kit/utils";
import type { F, O } from "@block-kit/utils/dist/es/types";
import type { BlockEditor, CorePlugin } from "@block-kit/x-core";
import type { Range } from "@block-kit/x-core";
import { Entry } from "@block-kit/x-core";
import type { ReactNode } from "react";

export type RenderToolbarContext = {
  range: Range;
  keys: O.Map<string>;
  isTextRange: boolean;
  isBlockRange: boolean;
  isMixedRange: boolean;
  forceUpdate: F.Plain;
};

type PluginWithRenderToolbar = CorePlugin & {
  renderToolbar: (context: RenderToolbarContext) => ReactNode;
};

export const EDITOR_TOOLBAR_PLUGIN_CACHE = new WeakMap<BlockEditor, PluginWithRenderToolbar[]>();

export const getToolbarContext = (
  editor: BlockEditor,
  range: Range,
  forceUpdate: F.Plain
): RenderToolbarContext => {
  const blocks = editor.state.blocks;
  const isMixedRange = !range.isTextRange && !range.isBlockRange;
  let keys: O.Map<string> | null = null;
  let isEmptyKeys = false;
  for (let k = 0, n = range.nodes.length; k < n; k++) {
    const entry = range.nodes[k];
    const parentState = blocks[entry.id];
    if (!entry || !parentState) continue;
    const flat = parentState.getTreeNodes();
    for (let i = 0; i < flat.length; i++) {
      const state = flat[i];
      if (!state) continue;
      // 如果目前存在 marks, 并且存在文本内容, 则提取内部的 marks
      if (!isEmptyKeys && state.data.delta) {
        let ops = state.data.delta;
        // 仅有首尾 entry, 首 state, 且是文本 entry 才需要切分
        if ((!k || k === n - 1) && !i && Entry.isText(entry)) {
          const start = entry.start;
          const len = entry.len;
          ops = new Delta(ops).slice(start, start + len).ops;
        }
        keys = filterMarkMap(keys, ops);
        keys && !Object.keys(keys).length && (isEmptyKeys = true);
      }
    }
  }
  return {
    range,
    forceUpdate,
    isMixedRange,
    keys: keys || {},
    isTextRange: range.isTextRange,
    isBlockRange: range.isBlockRange,
  };
};

export const getToolbarPlugins = (editor: BlockEditor) => {
  const cache = EDITOR_TOOLBAR_PLUGIN_CACHE.get(editor);
  if (cache) return cache;
  const plugins = editor.plugin.current as PluginWithRenderToolbar[];
  const toolbarPlugins = plugins.filter(plugin => plugin.renderToolbar);
  EDITOR_TOOLBAR_PLUGIN_CACHE.set(editor, toolbarPlugins);
  return toolbarPlugins;
};

export const filterMarkMap = (keys: O.Map<string> | null, ops: Op[]): O.Map<string> | null => {
  const firstOp = ops[0];
  if (!firstOp || !firstOp.attributes) return {};
  const newKeys = isNil(keys) ? Object.assign({}, firstOp.attributes) : Object.assign({}, keys);
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (isEOLOp(op)) continue;
    const attrs = op.attributes;
    const opKeys = attrs && Object.keys(attrs);
    if (!opKeys || !opKeys.length) return {};
    // 全部存在且相同的属性才认为是此时存在的 mark, 否则移除该 mark
    for (const key of opKeys) {
      if (attrs[key] !== newKeys[key]) delete newKeys[key];
    }
  }
  return newKeys;
};
