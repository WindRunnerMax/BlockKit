import "../styles/index.scss";

import { EDITOR_EVENT } from "@block-kit/core";
import { PASS_FOCUS_KEY } from "@block-kit/plugin";
import { cs, isHTMLElement } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import { useEditorStatic } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect, useState } from "react";

import type { ToolbarProps } from "../types";
import { ToolbarContext } from "./store";

export const Toolbar: FC<ToolbarProps> = props => {
  const { editor } = useEditorStatic();
  const [keys, setKeys] = useState<Record<string, string>>({});

  const refreshMarks = useMemoFn(() => {
    const current = editor.selection.get();
    if (!current) {
      setKeys({});
      return void 0;
    }
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    };
  }, [editor.event, refreshMarks]);

  useEffect(() => {
    // 浮动工具栏的情况下, 挂载时需要刷新 marks
    refreshMarks();
  }, [refreshMarks]);

  return (
    <div
      ref={props.onRef}
      style={props.styles}
      className={cs("block-kit-x-float-toolbar", props.className)}
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
      <ToolbarContext.Provider
        value={{
          keys,
          editor,
          setKeys,
          refreshMarks,
          selection: editor.selection.get(),
        }}
      >
        {props.children}
      </ToolbarContext.Provider>
    </div>
  );
};
