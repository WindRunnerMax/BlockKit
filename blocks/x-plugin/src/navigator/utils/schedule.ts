import { PRIORITY_KEY } from "@block-kit/core";
import { DEFAULT_PRIORITY as D_P } from "@block-kit/utils";
import type { CorePlugin } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";

import type { NavigatorContext, NavigatorResult } from "../types";

const P_KEY = `${PRIORITY_KEY}renderNavigator`;

type PluginWithRenderNavigator = CorePlugin & {
  [P_KEY]?: number;
  renderNavigator: (context: NavigatorContext) => NavigatorResult;
};

export const EDITOR_TOOLBAR_PLUGIN_CACHE = new WeakMap<BlockEditor, PluginWithRenderNavigator[]>();

/**
 * 获取 navigator 插件
 * @param editor
 */
export const getNavigatorPlugins = (editor: BlockEditor) => {
  const cache = EDITOR_TOOLBAR_PLUGIN_CACHE.get(editor);
  if (cache) return cache;
  const plugins = editor.plugin.current as PluginWithRenderNavigator[];
  const navPlugins = plugins.filter(plugin => plugin.renderNavigator);
  navPlugins.sort((a, b) => (a[P_KEY] || D_P) - (b[P_KEY] || D_P));
  EDITOR_TOOLBAR_PLUGIN_CACHE.set(editor, navPlugins);
  return navPlugins;
};
