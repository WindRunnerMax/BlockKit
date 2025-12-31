import { rewriteRemoveChild } from "@block-kit/react";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { BlockEditor, BlockState } from "@block-kit/x-core";
import { X_BLOCK_ID_KEY, X_BLOCK_KEY, X_BLOCK_TYPE_KEY } from "@block-kit/x-core";
import type { FC } from "react";
import React from "react";

export type BlockXWrapViewProps = {
  editor: BlockEditor;
  state: BlockState;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onRef?: (ref: HTMLDivElement | null) => void;
};

const BlockXWrapView: FC<BlockXWrapViewProps> = props => {
  const { editor, state } = props;

  /**
   * 设置行 DOM 节点
   */
  const setModel = useMemoFn((ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setBlockModel(ref, state);
      rewriteRemoveChild(ref);
    }
    props.onRef && props.onRef(ref);
  });

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
      {props.children}
    </div>
  );
};

/** Wrap Block Model */
export const BlockXWrapModel = BlockXWrapView;
