import "../styles/editable.scss";

import { EDITOR_EVENT, EDITOR_KEY } from "@block-kit/core";
import { cs, ROOT_BLOCK } from "@block-kit/utils";
import { useForceUpdate, useIsMounted, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { Listener } from "@block-kit/x-core";
import { EDITOR_STATE, X_SELECTION_KEY } from "@block-kit/x-core";
import React, { useEffect, useLayoutEffect, useRef } from "react";

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
  const flushing = useRef(false);
  const { mounted } = useIsMounted();
  const { editor } = useEditorStatic();
  const { readonly } = useReadonly();
  const { forceUpdate } = useForceUpdate();
  const ref = useRef<HTMLDivElement>(null);
  const root = editor.state.getBlock(editor.state.rootId);

  /**
   * 挂载编辑器 DOM
   */
  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.mount(el);
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

  /**
   * 数据同步变更, 异步批量绘制变更
   */
  const onContentChange: Listener<"CONTENT_CHANGE"> = useMemoFn(() => {
    // 举个例子: 同步等待刷新的队列 => ||||||||
    // 进入更新行为后, 异步行为等待, 同步的队列由于 !flushing 全部被守卫
    // 主线程执行完毕后, 异步队列开始执行, 此时拿到的是最新数据, 以此批量重新渲染
    if (flushing.current) return void 0;
    flushing.current = true;
    Promise.resolve().then(() => {
      flushing.current = false;
      mounted.current && forceUpdate();
      editor.state.set(EDITOR_STATE.PAINTING, true);
    });
  });

  /**
   * 监听内容变更事件, 更新当前块视图
   */
  useLayoutEffect(() => {
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange, 1000);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor.event, onContentChange]);

  /**
   * 视图更新需要重新设置选区 无依赖数组
   */
  useLayoutEffect(() => {
    const selection = editor.selection.get();
    // 同步计算完成后更新浏览器选区, 等待 Paint
    if (editor.state.isFocused() && selection) {
      editor.logger.debug("UpdateDOMSelection");
      editor.selection.updateDOMSelection(true);
    }
  });

  /**
   * 视图更新需要触发视图绘制完成事件 无依赖数组
   * state  -> parent -> node -> child ->|
   * effect <- parent <- node <- child <-|
   */
  useEffect(() => {
    editor.logger.debug("OnPaint");
    editor.state.set(EDITOR_STATE.PAINTING, false);
    Promise.resolve().then(() => {
      editor.event.trigger(EDITOR_EVENT.PAINT, { id: ROOT_BLOCK });
    });
  });

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
      <BlockModel editor={editor} state={root} placeholder={props.placeholder}></BlockModel>
    </div>
  );
};
