import { DEFAULT_PRIORITY as D_P } from "@block-kit/utils";
import type { BlockEditor } from "@block-kit/x-core";

import type { NavigatorPlugin, NavigatorResult } from "../types";
import { NAV_PRIORITY_KEY } from "../types";

export type NavPluginCache = {
  icons: Required<NavigatorResult>["icon"][];
  simples: Required<NavigatorResult>["simple"][];
  menus: Required<NavigatorResult>["menu"][];
};

export const EDITOR_NAV_PLUGIN_CACHE = new WeakMap<BlockEditor, NavPluginCache>();

/**
 * 获取 navigator 插件
 * @param editor
 */
export const getNavigatorPlugins = (editor: BlockEditor, extra: NavigatorPlugin[]) => {
  const cache = EDITOR_NAV_PLUGIN_CACHE.get(editor);
  if (cache) return cache;
  const plugins = editor.plugin.current as unknown as NavigatorPlugin[];
  const navPlugins = plugins.filter(plugin => plugin.renderNavigator).concat(extra);
  navPlugins.sort((a, b) => (a[NAV_PRIORITY_KEY] || D_P) - (b[NAV_PRIORITY_KEY] || D_P));
  const res = navPlugins.map(plugin => plugin.renderNavigator());
  const icons = res.map(item => item.icon).filter(Boolean) as NavPluginCache["icons"];
  const simples = res.map(item => item.simple).filter(Boolean) as NavPluginCache["simples"];
  const menus = res.map(item => item.menu).filter(Boolean) as NavPluginCache["menus"];
  EDITOR_NAV_PLUGIN_CACHE.set(editor, { icons, simples, menus });
  return { icons, simples, menus } as NavPluginCache;
};
