import { rewriteRemoveChild } from "@block-kit/react";
import { useForceUpdate, useIsMounted, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { CorePlugin, Listener } from "@block-kit/x-core";
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
import React, { Fragment, useLayoutEffect, useMemo, useRef } from "react";

import { useLayoutEffectContext } from "../hooks/use-layout-context";
import type { ReactBlockContext, ReactWrapContext } from "../plugin/types";
import { TextModel } from "./text";

const BlockView: FC<{
  editor: BlockEditor;
  state: BlockState;
  className?: string;
}> = props => {
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
   * 处理子节点块结构
   */
  const children = useMemo(() => {
    const els = (
      <Fragment>
        {state.data.delta && <TextModel block={editor} key={state.id} state={state}></TextModel>}
        {state.children.map(child => {
          let block: JSX.Element | null = null;
          let plugin: CorePlugin | undefined;
          const blockContext: ReactBlockContext = {
            key: child.id,
            classList: ["block-kit-x-children"],
            blockState: child,
            style: {},
          };
          if ((plugin = editor.plugin.map[child.data.type]) && plugin.renderBlock) {
            block = plugin.renderBlock(blockContext);
          }
          if (!block) {
            block = React.createElement(BlockModel, {
              className: blockContext.classList.join(" "),
              key: blockContext.key,
              editor: editor,
              state: child,
            });
          }
          const wrapBlockContext: ReactWrapContext = {
            classList: [],
            blockState: child,
            style: {},
            children: block,
          };
          const plugins = editor.plugin.getPriorityPlugins(PLUGIN_FUNC.RENDER_WRAP);
          for (const wrapPlugin of plugins) {
            wrapBlockContext.children = wrapPlugin.renderWrap(wrapBlockContext);
          }
          return block;
        })}
      </Fragment>
    );
    return els;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.version, editor, state, editor.plugin]);

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
    >
      {children}
    </div>
  );
};

/** Block Model */
export const BlockModel = React.memo(BlockView);
