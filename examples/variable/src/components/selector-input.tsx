import type { Rect } from "@block-kit/core";
import { EDITOR_EVENT, relativeTo, VOID_KEY } from "@block-kit/core";
import { MountNode, preventReactEvent, useEditorStatic } from "@block-kit/react";
import { cs, preventNativeEvent } from "@block-kit/utils";
import type { FC } from "react";
import { createElement, useEffect, useRef, useState } from "react";

import { SEL_KEY } from "../utils/constant";

export const SelectorOptions: FC<{
  left: number;
  top: number;
  width: number;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  className?: string;
}> = props => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !el.parentElement) return void 0;
    const rect = el.getBoundingClientRect();
    const baseRect: Rect =
      el.parentElement === document.body
        ? {
            top: 0,
            left: 0,
            bottom: window.innerHeight,
            right: window.innerWidth,
            height: window.innerHeight,
            width: window.innerWidth,
          }
        : el.parentElement.getBoundingClientRect();
    const relative = relativeTo(rect, baseRect);
    if (relative.bottom > baseRect.height) {
      el.style.transform = "translateY(calc(-100% - 2em))";
    }
  }, []);

  return (
    <div
      ref={ref}
      className={cs("editable-selector-options", props.className)}
      style={{ left: props.left, top: props.top, width: props.width }}
      onMouseDown={preventNativeEvent}
    >
      {props.options.map((option, index) => (
        <div
          key={index}
          className={cs(option === props.value && "editable-selector-option-selected")}
          onClick={e => {
            preventNativeEvent(e);
            props.onChange(option);
          }}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export const SelectorInput: FC<{
  value: string;
  options: string[];
  optionsWidth: number;
  onChange: (v: string) => void;
}> = props => {
  const { editor } = useEditorStatic();
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (isOpen) {
      MountNode.unmount(editor, SEL_KEY);
    } else {
      const target = (e.target as HTMLSpanElement).closest(`[${VOID_KEY}]`);
      if (!target) return void 0;
      const rect = target.getBoundingClientRect();
      const onChange = (v: string) => {
        props.onChange && props.onChange(v);
        MountNode.unmount(editor, SEL_KEY);
        setIsOpen(false);
      };
      const Element = createElement(SelectorOptions, {
        value: props.value,
        width: props.optionsWidth,
        left: rect.left + rect.width / 2 - props.optionsWidth / 2,
        top: rect.top + rect.height + 4,
        options: props.options,
        onChange: onChange,
      });
      MountNode.mount(editor, SEL_KEY, Element);
      const onMouseDown = () => {
        setIsOpen(false);
        MountNode.unmount(editor, SEL_KEY);
        document.removeEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
      };
      document.addEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
    }
    setIsOpen(!isOpen);
  };

  return (
    <span className="editable-selector" onMouseDownCapture={preventReactEvent} onClick={onOpen}>
      {props.value}
      <svg
        className={cs("editable-selector-triangle", isOpen && "editable-selector-triangle-open")}
        viewBox="0 0 1024 1024"
        width="1em"
        height="1em"
        fill="currentColor"
      >
        <path d="M793.002667 341.333333H230.997333a42.666667 42.666667 0 0 0-30.165333 72.832l281.002667 281.002667a42.666667 42.666667 0 0 0 60.330666 0l281.002667-281.002667A42.752 42.752 0 0 0 793.002667 341.333333z"></path>
      </svg>
    </span>
  );
};
