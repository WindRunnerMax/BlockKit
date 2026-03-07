import { ZERO_SPACE_KEY, ZERO_SYMBOL } from "@block-kit/core";
import { NO_CURSOR } from "@block-kit/react";
import type { BlockEditor } from "@block-kit/x-core";
import { X_ZERO_KEY } from "@block-kit/x-core";
import type { FC } from "react";

export type ZeroSpaceProps = {
  /** 编辑器实例 */
  editor: BlockEditor;
  /** 展示光标 */
  cursor?: boolean;
  /** 获取 DOM 引用 */
  onRef?: (ref: HTMLSpanElement | null) => void;
};

/**
 * 零宽字符组件
 * @param props
 */
export const ZeroSpace: FC<ZeroSpaceProps> = props => {
  /**
   * 处理 ref 回调
   */
  const onRef = (dom: HTMLSpanElement | null) => {
    props.onRef && props.onRef(dom);
  };

  return (
    <span
      ref={onRef}
      {...{
        [ZERO_SPACE_KEY]: true,
        [X_ZERO_KEY]: true,
      }}
      style={props.cursor ? void 0 : NO_CURSOR}
    >
      {ZERO_SYMBOL}
    </span>
  );
};
