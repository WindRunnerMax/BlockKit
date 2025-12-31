import type { BlockState } from "@block-kit/x-core";
import { X_BLOCK_ID_KEY, X_BLOCK_KEY, X_BLOCK_TYPE_KEY } from "@block-kit/x-core";
import type { FC } from "react";
import React from "react";

export type InnerBlockViewProps = {
  state: BlockState;
  className?: string;
  onRef?: (ref: HTMLDivElement | null) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const InnerBlockXView: FC<InnerBlockViewProps> = props => {
  const state = props.state;

  return (
    <div
      {...{
        [X_BLOCK_KEY]: true,
        [X_BLOCK_TYPE_KEY]: state.data.type,
        [X_BLOCK_ID_KEY]: state.id,
      }}
      className={props.className}
      ref={props.onRef}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

/** Inner Block Model */
export const InnerBlockXModel = InnerBlockXView;
