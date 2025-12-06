import type { Editor, LineState } from "@block-kit/core";
import { isEmptyLine, PLACEHOLDER_KEY } from "@block-kit/core";
import type { FC } from "react";
import React from "react";

import { useComposing } from "../hooks/use-composing";

/**
 * 占位符组件
 * - 抽离组件的主要目标是避免父组件的 LayoutEffect 执行
 */
export const Placeholder: FC<{
  editor: Editor;
  lines: LineState[];
  placeholder: React.ReactNode | undefined;
}> = props => {
  const { isComposing } = useComposing(props.editor);

  return props.placeholder &&
    !isComposing &&
    props.lines.length === 1 &&
    isEmptyLine(props.lines[0], true) ? (
    <div
      {...{ [PLACEHOLDER_KEY]: true }}
      style={{
        position: "absolute",
        opacity: "0.3",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {props.placeholder}
    </div>
  ) : null;
};
