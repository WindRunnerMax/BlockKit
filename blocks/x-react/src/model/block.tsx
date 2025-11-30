import { PLACEHOLDER_KEY } from "@block-kit/core";
import { rewriteRemoveChild } from "@block-kit/react";
import { ROOT_BLOCK } from "@block-kit/utils";
import { useForceUpdate, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { Listener } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";
import type { BlockState } from "@block-kit/x-core";
import {
  EDITOR_EVENT,
  EDITOR_STATE,
  X_BLOCK_ID_KEY,
  X_BLOCK_KEY,
  X_BLOCK_TYPE_KEY,
} from "@block-kit/x-core";
import type { FC } from "react";
import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { useComposing } from "../hooks/use-composing";
import { TextModel } from "./text";

/**
 * Block Model
 * @param props
 */
const BlockView: FC<{
  editor: BlockEditor;
  state: BlockState;
  className?: string;
  placeholder?: string;
}> = props => {
  const { editor, state } = props;
  const flushing = useRef(false);
  const { forceUpdate } = useForceUpdate();
  const { isComposing } = useComposing(editor);

  /**
   * 设置行 DOM 节点
   */
  const setModel = useMemoFn((ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setBlockModel(ref, state);
      rewriteRemoveChild(ref);
    }
  });

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
      forceUpdate();
      flushing.current = false;
      editor.state.set(EDITOR_STATE.PAINTING, true);
    });
  });

  /**
   * 监听内容变更事件, 更新当前块视图
   */
  useLayoutEffect(() => {
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor.event, onContentChange]);

  /**
   * 视图更新需要重新设置选区 无依赖数组
   */
  useLayoutEffect(() => {
    if (state.data.type !== ROOT_BLOCK) return void 0;
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
    if (state.data.type !== ROOT_BLOCK) return void 0;
    editor.logger.debug("OnPaint");
    editor.state.set(EDITOR_STATE.PAINTING, false);
    Promise.resolve().then(() => {
      editor.event.trigger(EDITOR_EVENT.PAINT, { id: state.id });
    });
  });

  /**
   * 计算 placeholder
   */
  const placeholder = useMemo(() => {
    if (
      state.parent &&
      state.parent.data.type === ROOT_BLOCK &&
      props.placeholder &&
      !isComposing &&
      state.parent.children.length === 1 &&
      !state.children.length &&
      state.data.delta &&
      !state.data.delta.length
    ) {
      return props.placeholder;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComposing, props.placeholder, state, state.version]);

  /**
   * 处理子节点块结构
   */
  const children = useMemo(() => {
    const els: JSX.Element[] = [];
    if (state.data.delta) {
      els.push(<TextModel block={editor} key={state.id} state={state}></TextModel>);
    }
    for (const child of state.children) {
      const view = (
        <BlockView
          className="block-kit-x-children"
          key={child.id}
          editor={editor}
          state={child}
          placeholder={props.placeholder}
        ></BlockView>
      );
      els.push(view);
    }
    return els;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, state, state.version, props.placeholder]);

  return (
    <div
      key={state.id}
      {...{
        [X_BLOCK_KEY]: true,
        [X_BLOCK_TYPE_KEY]: state.data.type,
        [X_BLOCK_ID_KEY]: state.id,
        [PLACEHOLDER_KEY]: placeholder,
      }}
      className={props.className}
      ref={setModel}
    >
      {children}
    </div>
  );
};

export const BlockModel = React.memo(BlockView, (prev, next) => {
  return (
    prev.state.id === next.state.id &&
    prev.state.depth === next.state.depth &&
    prev.placeholder === next.placeholder &&
    prev.className === next.className
  );
});
