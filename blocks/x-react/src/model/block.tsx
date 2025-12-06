import { PLACEHOLDER_KEY } from "@block-kit/core";
import { rewriteRemoveChild } from "@block-kit/react";
import { ROOT_BLOCK } from "@block-kit/utils";
import { useForceUpdate, useIsMounted, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { Listener } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";
import type { BlockState } from "@block-kit/x-core";
import { EDITOR_EVENT, X_BLOCK_ID_KEY, X_BLOCK_KEY, X_BLOCK_TYPE_KEY } from "@block-kit/x-core";
import type { FC } from "react";
import React, { Fragment, useLayoutEffect, useMemo, useRef } from "react";

import { useComposing } from "../hooks/use-composing";
import { TextModel } from "./text";

const BlockView: FC<{
  editor: BlockEditor;
  state: BlockState;
  className?: string;
  placeholder?: string;
}> = props => {
  const { editor, state } = props;
  const flushing = useRef(false);
  const { mounted } = useIsMounted();
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
    const els = (
      <Fragment>
        {state.data.delta && <TextModel block={editor} key={state.id} state={state}></TextModel>}
        {state.children.map(child => (
          <BlockModel
            className="block-kit-x-children"
            key={child.id}
            editor={editor}
            state={child}
            placeholder={props.placeholder}
          ></BlockModel>
        ))}
      </Fragment>
    );

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

/** Block Model */
export const BlockModel = React.memo(BlockView);
