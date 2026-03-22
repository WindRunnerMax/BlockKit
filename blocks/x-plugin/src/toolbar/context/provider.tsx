import "../styles/index.scss";

import { PASS_FOCUS_KEY } from "@block-kit/plugin";
import { isHTMLElement } from "@block-kit/utils";
import type { FC } from "react";
import { useMemo } from "react";

import type { ToolbarProps } from "../types";

export const Toolbar: FC<ToolbarProps> = props => {
  const children = useMemo(() => {
    return [];
  }, []);

  if (!children.length) {
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
