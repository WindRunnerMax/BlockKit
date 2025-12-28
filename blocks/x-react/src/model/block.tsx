import { rewriteRemoveChild } from "@block-kit/react";
import { cs } from "@block-kit/utils";
import { useForceUpdate, useIsMounted, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { Listener } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";
import type { BlockState } from "@block-kit/x-core";
import {
  EDITOR_EVENT,
  PLUGIN_FUNC,
  STATE_TO_RENDER,
  X_BLOCK_ID_KEY,
  X_BLOCK_KEY,
  X_BLOCK_TYPE_KEY,
} from "@block-kit/x-core";
import type { FC } from "react";
import React, { createElement, useLayoutEffect, useMemo, useRef } from "react";

import { useLayoutEffectContext } from "../hooks/use-layout-context";
import type { ReactBlockContext, ReactWrapContext } from "../plugin/types";
import { BLOCK_CH_CLASS } from "../utils/constant";
import { TextModel } from "./text";

export type BlockViewProps = {
  editor: BlockEditor;
  state: BlockState;
  className?: string;
  childClsName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const BlockView: FC<BlockViewProps> = props => {
  const { editor, state } = props;
  const flushing = useRef(false);
  const { mounted } = useIsMounted();
  const { index, forceUpdate } = useForceUpdate();
  const { forceLayoutEffect } = useLayoutEffectContext();

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
  const onContentChange: Listener<"CONTENT_CHANGE"> = useMemoFn(e => {
    if (flushing.current || !e.changes[state.id]) return void 0;
    flushing.current = true;
    Promise.resolve().then(() => {
      flushing.current = false;
      mounted.current && forceUpdate();
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
   * 跨组件通知布局变更
   */
  useLayoutEffect(() => {
    forceLayoutEffect(state.id);
    STATE_TO_RENDER.set(state, forceUpdate);
  }, [forceLayoutEffect, forceUpdate, state, index]);

  /**
   * 处理文本子节点块结构
   */
  const text = useMemo(() => {
    return state.data.delta && <TextModel block={editor} key={state.id} state={state}></TextModel>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.version, editor, state]);

  /**
   * 处理块级子节点块结构
   */
  const children = useMemo(() => {
    return state.children.map(child => {
      const blockContext: ReactBlockContext = {
        key: child.id,
        state: child,
        style: {},
        classList: [],
      };
      const plugin = editor.plugin.map[child.data.type];
      if (plugin) {
        blockContext.children = plugin.renderBlock(blockContext);
      }
      const wrapContext: ReactWrapContext = {
        state: child,
        classList: blockContext.classList,
        style: blockContext.style,
        children: blockContext.children,
      };
      const plugins = editor.plugin.getPriorityPlugins(PLUGIN_FUNC.RENDER_WRAP);
      for (const wrapPlugin of plugins) {
        wrapContext.children = wrapPlugin.renderWrap(wrapContext);
      }
      if (!wrapContext.children) {
        wrapContext.children = createElement(BlockModel, {
          className: wrapContext.classList.join(" ") || void 0,
          key: blockContext.key,
          editor: editor,
          state: child,
          style: blockContext.style,
        });
      }
      return wrapContext.children;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.version, editor, state]);

  return (
    <div
      key={state.id}
      {...{
        [X_BLOCK_KEY]: true,
        [X_BLOCK_TYPE_KEY]: state.data.type,
        [X_BLOCK_ID_KEY]: state.id,
      }}
      className={props.className}
      ref={setModel}
      style={props.style}
    >
      {text}
      {/* 存在文本组件, 则需要渲染包装节点, 否则直接渲染子块结构即可 */}
      {text && children.length ? (
        <div className={cs(BLOCK_CH_CLASS, props.childClsName)}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
};

/** Block Model */
export const BlockModel = React.memo(BlockView);
