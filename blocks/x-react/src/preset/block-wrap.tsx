import { rewriteRemoveChild } from "@block-kit/react";
import { cs } from "@block-kit/utils";
import { useMemoFn, useSafeState } from "@block-kit/utils/dist/es/hooks";
import type { BlockEditor, BlockState, SelectionChangeEvent } from "@block-kit/x-core";
import {
  EDITOR_EVENT,
  POINT_TYPE,
  X_BLOCK_ID_KEY,
  X_BLOCK_KEY,
  X_BLOCK_TYPE_KEY,
} from "@block-kit/x-core";
import type { FC } from "react";
import React, { useEffect } from "react";

export type BlockXWrapViewProps = {
  editor: BlockEditor;
  state: BlockState;
  tag?: "div" | "td";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onRef?: (ref: HTMLElement | null) => void;
};

const BlockXWrapView: FC<BlockXWrapViewProps> = props => {
  const { editor, state, tag: Tag = "div" } = props;
  const [selected, setSelected] = useSafeState(false);

  /**
   * 设置行 DOM 节点
   */
  const setModel = (ref: HTMLElement | null) => {
    if (ref) {
      editor.model.setBlockModel(ref, state);
      rewriteRemoveChild(ref);
    }
    props.onRef && props.onRef(ref);
  };

  const onSelectionChange = useMemoFn((e: SelectionChangeEvent) => {
    const { current } = e;
    const entry = current && current.map[state.id];
    const isSelected = entry && entry.type === POINT_TYPE.BLOCK;
    setSelected(!!isSelected);
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    };
  }, [editor.event, onSelectionChange]);

  return (
    <Tag
      key={state.id}
      {...{
        [X_BLOCK_KEY]: true,
        [X_BLOCK_TYPE_KEY]: state.data.type,
        [X_BLOCK_ID_KEY]: state.id,
      }}
      ref={setModel}
      style={props.style}
      className={cs("block-kit-x-block-wrap", props.className, selected && "block-kit-x-selected")}
    >
      {props.children}
      {selected && <div className="block-kit-x-selected-cover" contentEditable={false} />}
    </Tag>
  );
};

/**
 * Wrap Block Model
 * - 渲染块级节点, 块视图的外部结构
 */
export const BlockXWrapModel = React.memo(BlockXWrapView);
