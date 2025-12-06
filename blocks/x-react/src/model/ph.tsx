import { PLACEHOLDER_KEY } from "@block-kit/core";
import type { BlockEditor, BlockState } from "@block-kit/x-core";
import type { FC } from "react";
import React from "react";

import { useComposing } from "../hooks/use-composing";

/**
 * 占位符组件
 * - 抽离组件的主要目标是避免父组件的 LayoutEffect 执行
 */
export const Placeholder: FC<{
  editor: BlockEditor;
  state: BlockState;
  placeholder: React.ReactNode | undefined;
}> = props => {
  const { state } = props;
  const { isComposing } = useComposing(props.editor);

  let placeholder: JSX.Element | null = null;
  if (
    props.placeholder &&
    !isComposing &&
    state.children.length === 1 &&
    state.children[0]!.data.delta &&
    !state.children[0]!.length
  ) {
    placeholder = props.placeholder as JSX.Element;
  }

  return placeholder ? (
    <div
      {...{ [PLACEHOLDER_KEY]: true }}
      style={{
        position: "absolute",
        opacity: "0.3",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {placeholder}
    </div>
  ) : null;
};
