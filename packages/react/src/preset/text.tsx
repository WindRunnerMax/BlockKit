import { LEAF_STRING } from "@block-kit/core";
import type { FC } from "react";

export type TextProps = {
  children: string;
  onRef?: (ref: HTMLSpanElement | null) => void;
};

/**
 * 文本节点
 * @param props
 */
export const Text: FC<TextProps> = props => {
  /**
   * 处理 ref 回调
   * - 节点执行时机为 ref -> layout effect -> effect
   * - 若是不保持引用不变, 会导致回调在 rerender 时被多次调用 null/span 状态
   * - https://18.react.dev/reference/react-dom/components/common#ref-callback
   * - 而若是保持引用不变, 会导致节点变化渲染时, 即使文本内容变化了, 也不会触发回调
   * - 因为 LEAF 映射 TEXT 依赖于回调函数的执行, 就会导致叶子对象变化时, 不会重新映射
   */
  const onRef = (dom: HTMLSpanElement | null) => {
    props.onRef && props.onRef(dom);
  };

  return (
    <span ref={onRef} {...{ [LEAF_STRING]: true }}>
      {props.children}
    </span>
  );
};
