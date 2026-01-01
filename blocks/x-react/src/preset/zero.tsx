import { ZERO_SPACE_KEY, ZERO_SYMBOL } from "@block-kit/core";
import { NO_CURSOR } from "@block-kit/react";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { BlockState } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";
import { X_ZERO_KEY } from "@block-kit/x-core";
import type { FC } from "react";

export type ZeroSpaceProps = {
  /** Block 状态 */
  state: BlockState;
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
   * - 需要保证引用不变, 否则会导致回调在 rerender 时被多次调用 null/span 状态
   * - https://18.react.dev/reference/react-dom/components/common#ref-callback
   */
  const onRef = useMemoFn((dom: HTMLSpanElement | null) => {
    props.onRef && props.onRef(dom);
    dom && props.editor.model.setZeroNode(props.state, dom);
  });

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
