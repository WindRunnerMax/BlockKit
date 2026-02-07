import type { Rect } from "@block-kit/core";
import { relativeTo } from "@block-kit/core";
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
    if (relative.bottom > baseRect.height) {
      el.style.transform = `translateY(calc(-100% - ${offset}px))`;
    } else {
      el.style.transform = `translateY(${offset}px)`;
    }
  }, []);
};
