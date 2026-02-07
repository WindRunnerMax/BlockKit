import "../styles/selector.scss";

import { IconDown } from "@arco-design/web-react/icon";
import { cs, preventNativeEvent, stopNativeEvent } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { MountNode, useEditorStatic } from "@block-kit/x-react";
import type { FC } from "react";
import { createElement, useRef, useState } from "react";

import { useRectAdapterEffect } from "../hooks/use-rect-adapter";
import { getMountRect } from "../utils/dom";

export const SelectorOptions: FC<{
  className?: string;
  left: number;
  top: number;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}> = props => {
  const ref = useRef<HTMLDivElement>(null);

  useRectAdapterEffect(ref, 20);

  const onOptionClick = (v: string) => {
    props.onChange(v);
  };

  return (
    <div
      ref={ref}
      style={{ left: props.left, top: props.top }}
      className="block-kit-x-selector-options-container"
      onClick={stopNativeEvent}
      onMouseDown={preventNativeEvent}
    >
      {props.options.map((item, index) => (
        <div
          key={index}
          className={cs("block-kit-x-selector-options", item === props.value && "x-active")}
          onClick={() => onOptionClick(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export const Selector: FC<{
  disabled?: boolean;
  className?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  id: string;
  children?: never;
}> = props => {
  const { editor } = useEditorStatic();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeOptions = useMemoFn((): undefined => {
    setIsOpen(false);
    MountNode.unmount(editor, props.id);
  });

  const onTrigger = (e: React.MouseEvent) => {
    stopNativeEvent(e);
    if (isOpen) {
      closeOptions();
      return void 0;
    }
    setIsOpen(true);
    const rect = getMountRect(editor, ref.current);
    const el = createElement(SelectorOptions, {
      left: rect.left,
      top: rect.top,
      value: props.value,
      options: props.options,
      onChange: (v: string) => closeOptions() || props.onChange(v),
    });
    MountNode.mount(editor, props.id, el);
    document.addEventListener(EDITOR_EVENT.CLICK, closeOptions, { once: true });
  };

  return (
    <div ref={ref} className={cs("block-kit-x-selector", props.className)} onClick={onTrigger}>
      {props.value}
      {!props.disabled && <IconDown style={{ transform: isOpen ? "rotate(180deg)" : undefined }} />}
    </div>
  );
};
