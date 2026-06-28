import "../styles/trigger.scss";

import { cs, isDOMElement, isUndef } from "@block-kit/utils";
import type { P } from "@block-kit/utils/dist/es/types";
import type { FC, ReactElement } from "react";
import React, { cloneElement, Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { TriggerContextRef } from "../hooks/use-trigger";
import { getPopupPosition } from "../utils/trigger";

// https://github.com/arco-design/arco-design/blob/main/components/Trigger/index.tsx
export const Trigger: FC<{
  children: ReactElement;
  popup: () => React.ReactNode;
  onContextRef?: TriggerContextRef;
  position?: "left" | "lt";
  popupVisible?: boolean;
  setPopupVisible?: (visible: boolean) => void;
  popupClassName?: string;
  duration?: number;
  disabled?: boolean;
  getPopupContainer?: () => HTMLElement;
  popupAlign?: { top: number; left: number };
  uncontrolled?: boolean;
}> = props => {
  const { popupAlign } = props;
  const isMounted = useRef(false);
  const rect = useRef<DOMRect | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  const position = props.position || "left";
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

  const setPopupVisibleState = (visibleState: boolean, delay = 300) => {
    const currentVisible = popupVisible;

    if (visibleState !== currentVisible) {
      delayToDo(delay, async () => {
        setPopupVisible(visibleState);
      });
    }
  };

  const onMouseEnter = (e: MouseEvent | React.MouseEvent) => {
    // 鼠标进入时更新弹窗位置信息
    const target = e.currentTarget || e.target;
    if (isDOMElement(target)) {
      rect.current = target.getBoundingClientRect();
    }
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
    }
  };

  let childNode: ReactElement;
  if (props.uncontrolled && props.onContextRef) {
    childNode = props.children;
    props.onContextRef.current.onChildRef = onChildRef;
    props.onContextRef.current.onMouseEnter = onMouseEnter;
    props.onContextRef.current.onMouseLeave = onMouseLeave;
  } else {
    const childProps: P.Any = props.children.props;
    const onMouseEnterBridge = (e: React.MouseEvent) => {
      onMouseEnter(e);
      childProps.onMouseEnter && childProps.onMouseEnter(e);
    };
    const onMouseLeaveBridge = () => {
      onMouseLeave();
      childProps.onMouseLeave && childProps.onMouseLeave();
    };
    childNode = cloneElement(props.children, {
      ref: onChildRef,
      onMouseEnter: onMouseEnterBridge,
      onMouseLeave: onMouseLeaveBridge,
    });
  }

  const popupContainer = props.getPopupContainer ? props.getPopupContainer() : document.body;

  const popupNode = !!rect.current && popupVisible && (
    <span
      className={cs("block-kit-x-trigger-popup", props.popupClassName)}
      style={getPopupPosition(rect, position, popupContainer, popupAlign)}
      ref={popupRef}
      onMouseEnter={onPopupMouseEnter}
      onMouseLeave={onPopupMouseLeave}
    >
      {props.popup()}
    </span>
  );

  const popupPortal = popupVisible ? createPortal(popupNode, popupContainer) : null;

  return (
    <Fragment>
      {childNode}
      {popupPortal}
    </Fragment>
  );
};
