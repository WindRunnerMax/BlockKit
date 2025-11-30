import { ZERO_SPACE_KEY, ZERO_SYMBOL } from "@block-kit/core";
import { NO_CURSOR } from "@block-kit/react";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import { X_ZERO_KEY } from "@block-kit/x-core";
import type { FC } from "react";

export type ZeroSpaceProps = {
  /** 隐藏光标 */
  hide?: boolean;
  /** 块占位节点 */
  block?: boolean;
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
  });

  return (
    <span
      ref={onRef}
      {...{
        [ZERO_SPACE_KEY]: true,
        [X_ZERO_KEY]: props.block,
      }}
      style={props.hide ? NO_CURSOR : void 0}
    >
      {ZERO_SYMBOL}
    </span>
  );
};
