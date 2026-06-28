import type React from "react";

export const getPopupPosition = (
  rect: React.MutableRefObject<DOMRect | null>,
  position: "left" | "lt",
  container: HTMLElement,
  popupAlign?: { top: number; left: number }
): React.CSSProperties => {
  if (!rect.current) return { left: -999, top: -999 };
  const offsetLeft = popupAlign ? popupAlign.left : 0;
  const offsetTop = popupAlign ? popupAlign.top : 0;
  const box = rect.current;
  const left = box.left + offsetLeft;
  let top = box.top + offsetTop;
  if (position === "left") {
    top = top + box.height / 2;
  }
  if (container === document.body) {
    top = top + document.documentElement.scrollTop;
  } else {
    top = top - container.scrollTop;
  }
  const TRANSFORM = {
    lt: `translate(-100%, 0)`,
    left: `translate(-100%, -50%)`,
  };
  return {
    top: top,
    left: left,
    transform: TRANSFORM[position],
  };
};
