import { NOOP } from "@block-kit/utils";
import type { MutableRefObject } from "react";
import { useRef } from "react";

export type TriggerContext = {
  onMouseLeave: (e: MouseEvent) => void;
  onMouseEnter: (e: MouseEvent) => void;
  onChildRef: (ref: HTMLElement | null) => void;
};

export type TriggerContextRef = MutableRefObject<TriggerContext>;

const DEFAULT_TRIGGER_CONTEXT: TriggerContext = {
  onMouseLeave: NOOP,
  onMouseEnter: NOOP,
  onChildRef: NOOP,
};

export const useTriggerContext = () => {
  const ref = useRef<TriggerContext>(Object.assign({}, DEFAULT_TRIGGER_CONTEXT));

  return ref;
};
