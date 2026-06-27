import "../styles/trigger.scss";

import { cs, isUndef } from "@block-kit/utils";
import type { FC, ReactElement } from "react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { TriggerContextRef } from "../hooks/use-trigger";

export const Trigger: FC<{
  children: ReactElement;
  popup: () => React.ReactNode;
  onContextRef: TriggerContextRef;
  popupVisible?: boolean;
  setPopupVisible?: (visible: boolean) => void;
  popupClassName?: string;
  duration?: number;
  disabled?: boolean;
  getPopupContainer?: () => HTMLElement;
  popupAlign?: { top: number; left: number };
}> = props => {
  const { popupAlign } = props;
  const isMounted = useRef(false);
  const rect = useRef<DOMRect | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  const popupVisible = isUndef(props.popupVisible) ? visible : props.popupVisible;
  const setPopupVisible = isUndef(props.setPopupVisible) ? setVisible : props.setPopupVisible;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (props.disabled) {
    return props.children;
  }

  if (props.children.type !== "div") {
    console.warn("Expect a div element as children.");
    return props.children;
  }

  const clearDelayTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const delayToDo = (delay: number, callback: () => void) => {
    if (delay) {
      clearDelayTimer();
      timer.current = setTimeout(() => {
        callback();
        clearDelayTimer();
      }, delay);
    } else {
      callback();
    }
  };

  const setPopupVisibleState = (visibleState: boolean, delay = 0) => {
    const currentVisible = popupVisible;

    if (visibleState !== currentVisible) {
      delayToDo(delay, async () => {
        setPopupVisible(visibleState);
      });
    }
  };

  const onMouseEnter = () => {
    const mouseEnterDelay = props.duration;
    clearDelayTimer();
    setPopupVisibleState(true, mouseEnterDelay);
  };

  const onMouseLeave = () => {
    const mouseLeaveDelay = props.duration;
    clearDelayTimer();
    if (popupVisible) {
      setPopupVisibleState(false, mouseLeaveDelay);
    }
  };

  const onPopupMouseEnter = () => {
    clearDelayTimer();
  };

  const onPopupMouseLeave = () => {
    const mouseLeaveDelay = props.duration;
    clearDelayTimer();
    if (popupVisible) {
      setPopupVisibleState(false, mouseLeaveDelay);
    }
  };

  const onChildRef = (ref: HTMLElement | null) => {
    if (ref) {
      nodeRef.current = ref;
      rect.current = ref.getBoundingClientRect();
    }
  };

  const childNode = props.children;
  props.onContextRef.current.onMouseEnter = onMouseEnter;
  props.onContextRef.current.onMouseLeave = onMouseLeave;
  props.onContextRef.current.onChildRef = onChildRef;

  const popupNode = !!rect.current && (
    <span
      className={cs("block-kit-x-trigger-popup", props.popupClassName)}
      style={{
        top: rect.current.top + (popupAlign ? popupAlign.top : 0),
        left: rect.current.left + (popupAlign ? popupAlign.left : 0),
      }}
      ref={popupRef}
      onMouseEnter={onPopupMouseEnter}
      onMouseLeave={onPopupMouseLeave}
    >
      {props.popup()}
    </span>
  );

  const popupContainer = props.getPopupContainer ? props.getPopupContainer() : document.body;

  const popupPortal = popupVisible ? createPortal(popupNode, popupContainer) : null;

  return (
    <Fragment>
      {childNode}
      {popupPortal}
    </Fragment>
  );
};
