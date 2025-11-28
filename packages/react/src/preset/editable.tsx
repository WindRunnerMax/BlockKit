import { EDITOR_KEY, Point, Range } from "@block-kit/core";
import { cs } from "@block-kit/utils";
import React, { useEffect, useLayoutEffect, useRef } from "react";

import { useEditorStatic } from "../hooks/use-editor";
import { useReadonly } from "../hooks/use-readonly";
import { BlockModel } from "../model/block";

/**
 * Editable 编辑节点
 * @param props
 */
export const Editable: React.FC<{
  /** 节点类名 */
  className?: string;
  /** 自动聚焦 */
  autoFocus?: boolean;
  /**
   * 占位节点
   * - 节点会脱离文档流, 需要注意 CSS 布局
   * - data-node 节点样式需要同步 data-placeholder
   * - 伪元素模式仅支持文本, 可以配合 data-block 处理
   */
  placeholder?: React.ReactNode;
  /**
   * 阻止编辑器主动销毁
   * - 谨慎使用, 编辑器生命周期结束必须主动销毁
   * - 注意保持值不可变, 否则会导致编辑器多次挂载
   */
  preventDestroy?: boolean;
}> = props => {
  const { className, autoFocus, preventDestroy } = props;
  const { editor } = useEditorStatic();
  const { readonly } = useReadonly();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.mount(el);
    return () => {
      editor.unmount();
      !preventDestroy && editor.destroy();
    };
  }, [editor, preventDestroy]);

  useEffect(() => {
    // COMPAT: 这里有个奇怪的表现
    // 当自动聚焦时, 必须要先更新浏览器选区再聚焦
    // 否则会造成立即按下回车时, 光标不会跟随选区移动
    // 无论是 Model 选区还是浏览器选区, 都已经更新但是却不移动
    if (autoFocus) {
      const start = new Point(0, 0);
      editor.selection.set(new Range(start, start), true);
      editor.selection.focus();
    }
  }, [autoFocus, editor.selection]);

  return (
    <div
      ref={ref}
      className={cs(className, "notranslate")}
      {...{ [EDITOR_KEY]: true }}
      contentEditable={!readonly}
      suppressContentEditableWarning
      spellCheck={false}
      style={{
        outline: "none",
        position: "relative",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      <BlockModel
        editor={editor}
        state={editor.state.block}
        placeholder={props.placeholder}
      ></BlockModel>
    </div>
  );
};
