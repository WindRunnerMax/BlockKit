import "../styles/editable.scss";

import { EDITOR_EVENT, EDITOR_KEY } from "@block-kit/core";
import { cs } from "@block-kit/utils";
import { useForceUpdate, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { Listener } from "@block-kit/x-core";
import { EDITOR_STATE, X_SELECTION_KEY } from "@block-kit/x-core";
import type { ReactNode } from "react";
import React, { useLayoutEffect, useRef } from "react";

import { useEditorStatic } from "../hooks/use-editor";
import { LayoutEffectContext } from "../hooks/use-layout-context";
import { useReadonly } from "../hooks/use-readonly";
import { BlockModel } from "../model/block";
import { PaintEffectModel } from "../model/effect";
import { Placeholder } from "../model/ph";

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
  placeholder?: ReactNode;
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
  const { index, forceUpdate } = useForceUpdate();
  const ref = useRef<HTMLDivElement>(null);
  const flushing = useRef<Set<string> | null>(null);
  const root = editor.state.getBlock(editor.state.rootId);

  /**
   * 数据同步变更, 异步批量绘制变更
   */
  const onContentChange: Listener<"CONTENT_CHANGE"> = useMemoFn(e => {
    flushing.current = new Set();
    for (const blockId of Object.keys(e.changes)) {
      if (e.deletes.has(blockId)) continue;
      flushing.current.add(blockId);
    }
  });

  /**
   * 监听内容变更事件, 更新当前块视图
   */
  useLayoutEffect(() => {
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange, 10);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor.event, onContentChange]);

  /**
   * 子节点的布局变更通知
   * @param id
   */
  const onTreeBlockLayoutEffect = useMemoFn((id: string) => {
    if (!flushing.current) return void 0;
    flushing.current.delete(id);
    if (!flushing.current.size) {
      forceUpdate();
      flushing.current = null;
      editor.state.set(EDITOR_STATE.PAINTING, true);
    }
  });

  /**
   * 挂载编辑器 DOM
   */
  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.mount(el);
    // 创建隐藏的选区元素
    const textarea = document.createElement("textarea");
    textarea.hidden = true;
    textarea.setAttribute(X_SELECTION_KEY, "true");
    document.body.appendChild(textarea);
    editor.selection.element = textarea;
    return () => {
      editor.unmount();
      textarea.remove();
      !preventDestroy && editor.destroy();
    };
  }, [editor, preventDestroy]);

  if (!root) {
    editor.logger.error("Missing Root Block");
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
      <PaintEffectModel editor={editor} index={index} />
      <Placeholder state={root} editor={editor} placeholder={props.placeholder} />
      <LayoutEffectContext.Provider value={onTreeBlockLayoutEffect}>
        <BlockModel editor={editor} state={root}></BlockModel>
      </LayoutEffectContext.Provider>
    </div>
  );
};
