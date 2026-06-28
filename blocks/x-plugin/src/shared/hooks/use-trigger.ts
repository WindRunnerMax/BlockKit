import { NOOP } from "@block-kit/utils";
import type { MutableRefObject } from "react";
import { useRef } from "react";

export type TriggerContext = {
  onMouseLeave: (e: MouseEvent | React.MouseEvent) => void;
  onMouseEnter: (e: MouseEvent | React.MouseEvent) => void;
  onChildRef: (ref: HTMLElement | null) => void;
};

export type TriggerContextRef = MutableRefObject<TriggerContext>;

export const useTriggerContext = () => {
  const ref = useRef<TriggerContext>({
    onMouseLeave: NOOP,
    onMouseEnter: NOOP,
    onChildRef: NOOP,
  });

  return ref;
};
