import "../styles/index.scss";

import { PASS_FOCUS_KEY } from "@block-kit/plugin";
import { isHTMLElement } from "@block-kit/utils";
import { useForceUpdate } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import { useMemo } from "react";

import type { ToolbarProps } from "../types";
import { getToolbarContext, getToolbarPlugins } from "../utils/schedule";

export const Toolbar: FC<ToolbarProps> = props => {
  const { index: updateIndex, forceUpdate } = useForceUpdate();

  const children = useMemo(() => {
    const range = props.range;
    if (!range) return null;
    const plugins = getToolbarPlugins(props.editor);
    const context = getToolbarContext(props.editor, range, forceUpdate);
    return plugins.map(plugin => plugin.renderToolbar(context));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateIndex, props.editor, props.range, forceUpdate]);

  if (!children || !children.length) {
    return null;
  }

  return (
    <div
      className="block-kit-x-float-toolbar"
      style={{ left: props.left, top: props.top }}
      onMouseDown={e => {
        const target = e.target;
        // 避免 float 的情况下触发按下事件
        e.stopPropagation();
        // 存在需要抢夺焦点的情况, 例如超链接输入的弹出层
        if (isHTMLElement(target) && target.hasAttribute(PASS_FOCUS_KEY)) {
          return void 0;
        }
        e.preventDefault();
      }}
    >
      {children}
    </div>
  );
};
