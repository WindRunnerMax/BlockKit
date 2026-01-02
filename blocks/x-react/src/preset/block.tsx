import { cs, SPACE } from "@block-kit/utils";
import { useForceUpdate, useIsMounted, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { Listener } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";
import type { BlockState } from "@block-kit/x-core";
import { EDITOR_EVENT, PLUGIN_FUNC, STATE_TO_RENDER } from "@block-kit/x-core";
import type { FC } from "react";
import React, { createElement, Fragment, useLayoutEffect, useMemo, useRef } from "react";

import { useLayoutEffectContext } from "../hooks/use-layout-context";
import { TextModel } from "../model/text";
import type {
  ReactBlockContext,
  ReactBlockWrapContext,
  ReactTextWrapContext,
} from "../plugin/types";
import { BLOCK_CH_CLASS } from "../utils/constant";
import { BlockXWrapModel } from "./block-wrap";

export type BlockViewProps = {
  editor: BlockEditor;
  state: BlockState;
  childClsName?: string;
};

const BlockXView: FC<BlockViewProps> = props => {
  const { editor, state } = props;
  const flushing = useRef(false);
  const { mounted } = useIsMounted();
  const { index, forceUpdate } = useForceUpdate();
  const { forceLayoutEffect } = useLayoutEffectContext();

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
    if (!state.data.delta) return null;
    const el = <TextModel block={editor} key={state.id} state={state}></TextModel>;
    const wrapContext: ReactTextWrapContext = {
      state: state,
      children: el,
    };
    const plugins = editor.plugin.getPriorityPlugins(PLUGIN_FUNC.RENDER_TEXT_WRAP);
    for (const wrapPlugin of plugins) {
      wrapContext.children = wrapPlugin.renderTextWrap(wrapContext);
    }
    return wrapContext.children;
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
        childClsList: [],
      };
      const plugin = editor.plugin.map[child.data.type];
      if (plugin) {
        blockContext.children = plugin.renderBlock(blockContext);
      }
      if (!blockContext.children) {
        blockContext.children = createElement(BlockXModel, {
          editor: editor,
          state: child,
          childClsName: blockContext.childClsList.join(SPACE) || void 0,
        });
      }
      const wrapContext: ReactBlockWrapContext = {
        state: child,
        classList: blockContext.classList,
        style: blockContext.style,
        children: blockContext.children,
      };
      const plugins = editor.plugin.getPriorityPlugins(PLUGIN_FUNC.RENDER_BLOCK_WRAP);
      for (const wrapPlugin of plugins) {
        wrapContext.children = wrapPlugin.renderBlockWrap(wrapContext);
      }
      return createElement(
        BlockXWrapModel,
        {
          key: blockContext.key,
          editor: editor,
          state: child,
          style: wrapContext.style,
          className: wrapContext.classList.join(SPACE) || void 0,
        },
        wrapContext.children
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.version, editor, state]);

  return (
    <Fragment>
      {text}
      {/* 存在文本组件, 则需要渲染包装节点, 否则直接渲染子块结构即可 */}
      {text && children.length ? (
        <div className={cs(BLOCK_CH_CLASS, props.childClsName)}>{children}</div>
      ) : (
        children
      )}
    </Fragment>
  );
};

/** Block Model */
export const BlockXModel = React.memo(BlockXView);
