import { EDITOR_EVENT, ISOLATED_KEY } from "@block-kit/core";
import { stopNativeEvent } from "@block-kit/utils";
import type { FC, PropsWithChildren } from "react";
import React, { useEffect, useState } from "react";

export type IsolateProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
}>;

/**
 * 独立节点嵌入 HOC
 * - 独立区域 完全隔离相关事件
 * @param props
 */
export const Isolate: FC<IsolateProps> = props => {
  const [ref, setRef] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref;
    if (!el) return void 0;
    const {
      BEFORE_INPUT,
      MOUSE_DOWN,
      COPY,
      KEY_DOWN,
      PASTE,
      CUT,
      INPUT,
      FOCUS,
      BLUR,
      CLICK,
      COMPOSITION_END,
      COMPOSITION_START,
      COMPOSITION_UPDATE,
    } = EDITOR_EVENT;
    el.addEventListener(CLICK, stopNativeEvent);
    el.addEventListener(MOUSE_DOWN, stopNativeEvent);
    el.addEventListener(CUT, stopNativeEvent);
    el.addEventListener(COPY, stopNativeEvent);
    el.addEventListener(PASTE, stopNativeEvent);
    el.addEventListener(FOCUS, stopNativeEvent);
    el.addEventListener(BLUR, stopNativeEvent);
    el.addEventListener(KEY_DOWN, stopNativeEvent);
    el.addEventListener(INPUT, stopNativeEvent);
    el.addEventListener(BEFORE_INPUT, stopNativeEvent);
    el.addEventListener(COMPOSITION_START, stopNativeEvent);
    el.addEventListener(COMPOSITION_UPDATE, stopNativeEvent);
    el.addEventListener(COMPOSITION_END, stopNativeEvent);
    return () => {
      el.removeEventListener(CLICK, stopNativeEvent);
      el.removeEventListener(MOUSE_DOWN, stopNativeEvent);
      el.removeEventListener(CUT, stopNativeEvent);
      el.removeEventListener(COPY, stopNativeEvent);
      el.removeEventListener(PASTE, stopNativeEvent);
      el.removeEventListener(FOCUS, stopNativeEvent);
      el.removeEventListener(BLUR, stopNativeEvent);
      el.removeEventListener(KEY_DOWN, stopNativeEvent);
      el.removeEventListener(INPUT, stopNativeEvent);
      el.removeEventListener(BEFORE_INPUT, stopNativeEvent);
      el.removeEventListener(COMPOSITION_START, stopNativeEvent);
      el.removeEventListener(COMPOSITION_UPDATE, stopNativeEvent);
      el.removeEventListener(COMPOSITION_END, stopNativeEvent);
    };
  }, [ref]);

  return (
    <span
      ref={setRef}
      {...{ [ISOLATED_KEY]: true }}
      className={props.className}
      style={props.style}
      contentEditable={false}
    >
      {props.children}
    </span>
  );
};
