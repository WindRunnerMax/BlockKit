import "../styles/trigger.scss";

import { cs } from "@block-kit/utils";
import type { FC, ReactElement } from "react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const Trigger: FC<{
  children: ReactElement;
  popup: () => React.ReactNode;
  popupClassName?: string;
  duration?: number;
  disabled?: boolean;
  getPopupContainer?: () => HTMLElement;
  onMouseEnter?: (e: React.MouseEvent) => void;
  popupAlign?: { top: number; left: number };
}> = props => {
  const { popupAlign } = props;
  const isMounted = useRef(false);
  const rect = useRef<DOMRect | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLElement | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

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

  const setPopupVisibleState = (visible: boolean, delay = 0) => {
    const currentVisible = popupVisible;

    if (visible !== currentVisible) {
      delayToDo(delay, async () => {
        setPopupVisible(visible);
      });
    }
  };

  const onMouseEnter = (e: React.MouseEvent) => {
    props.onMouseEnter && props.onMouseEnter(e);
    if (e.nativeEvent.cancelBubble) return;
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

  const childNode = React.cloneElement(props.children, {
    ref: onChildRef,
    onMouseEnter,
    onMouseLeave,
  });

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
