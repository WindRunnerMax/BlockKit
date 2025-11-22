import { EDITOR_KEY } from "@block-kit/core";
import { cs } from "@block-kit/utils";
import React, { useLayoutEffect, useRef } from "react";

import { useEditorStatic } from "../hooks/use-editor";
import { useReadonly } from "../hooks/use-readonly";
import { BlockModel } from "../model/block";

/**
 * Editable 编辑节点
 * @param props
 */
export const EditableX: React.FC<{
  /** 节点类名 */
  className?: string;
  /** 自动聚焦 */
  autoFocus?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /**
   * 阻止编辑器主动销毁
   * - 谨慎使用, 编辑器生命周期结束必须主动销毁
   * - 注意保持值不可变, 否则会导致编辑器多次挂载
   */
  preventDestroy?: boolean;
}> = props => {
  const { className, preventDestroy } = props;
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

  const root = editor.state.getBlock(editor.state.rootId);
  if (!root) {
    editor.logger.error("Root block not found");
    return null;
  }

  return (
    <div
      ref={ref}
      className={cs(className, "notranslate")}
      {...{ [EDITOR_KEY]: true }}
      contentEditable={!readonly}
      suppressContentEditableWarning
      style={{
        outline: "none",
        position: "relative",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      <BlockModel editor={editor} state={root} placeholder={props.placeholder}></BlockModel>
    </div>
  );
};
