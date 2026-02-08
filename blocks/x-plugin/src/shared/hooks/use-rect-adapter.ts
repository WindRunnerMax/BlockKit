import type { Rect } from "@block-kit/core";
import { relativeTo } from "@block-kit/core";
import { SPACE } from "@block-kit/utils";
import type { RefObject } from "react";
import { useLayoutEffect } from "react";

export const useRectAdapterEffect = (ref: RefObject<HTMLDivElement | null>, offset: number) => {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.parentElement) return void 0;
    const rect = el.getBoundingClientRect();
    const baseRect: Rect = {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      right: window.innerWidth,
      height: window.innerHeight,
      width: window.innerWidth,
    };
    const relative = relativeTo(rect, baseRect);
    const transform: string[] = [];
    if (relative.bottom > baseRect.height) {
      transform.push(`translateY(calc(-100% - ${offset}px))`);
    } else {
      transform.push(`translateY(${offset}px)`);
    }
    if (relative.right > baseRect.width) {
      transform.push(`translateX(-100%)`);
    } else {
      transform.push(`translateX(-25%)`);
    }
    el.style.transform = transform.join(SPACE);
  }, []);
};
