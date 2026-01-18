import { EDITOR_EVENT } from "@block-kit/core";
import { Isolate } from "@block-kit/react";
import {
  isDOMText,
  isKeyCode,
  isNil,
  KEY_CODE,
  preventNativeEvent,
  TEXT_PLAIN,
} from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { O } from "@block-kit/utils/dist/es/types";
import type { FC } from "react";
import React, { useEffect, useLayoutEffect, useState } from "react";

import { DATA_EDITABLE_KEY } from "../utils/constant";

export const EditableTextInput: FC<{
  value: string;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  onKeydown?: (e: KeyboardEvent) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onRef?: (ref: HTMLDivElement | null) => void;
  onChange: (value: string, event: InputEvent) => void;
}> = props => {
  const { onChange, value, placeholder } = props;
  const [isComposing, setIsComposing] = useState(false);
  const [editNode, setEditNode] = useState<HTMLDivElement | null>(null);

  const onEditableRef = useMemoFn((ref: HTMLDivElement | null) => {
    props.onRef && props.onRef(ref);
    ref && setEditNode(ref);
  });

  useLayoutEffect(() => {
    if (!editNode) return void 0;
    // 如果受控, 选区行为可以考虑从后向前找到差异位置作为选区
    if (isDOMText(editNode.firstChild)) {
      if (editNode.firstChild.nodeValue !== props.value) {
        editNode.firstChild.nodeValue = props.value;
      }
      for (let i = 1, len = editNode.childNodes.length; i < len; i++) {
        const child = editNode.childNodes[i];
        child && child.remove();
      }
    } else {
      editNode.innerText = props.value;
    }
  }, [props.value, editNode]);

  const onBeforeInput = useMemoFn((e: InputEvent) => {
    props.onBeforeInput && props.onBeforeInput(e);
  });

  const onInput = useMemoFn((e: Event) => {
    if ((e as O.Any).isComposing || isNil(editNode)) {
      return void 0;
    }
    const newValue = editNode.textContent || "";
    newValue !== value && onChange(newValue, e as InputEvent);
  });

  const onCompositionStart = useMemoFn(() => {
    setIsComposing(true);
  });

  const onCompositionEnd = useMemoFn((e: CompositionEvent) => {
    setIsComposing(false);
    onInput(e);
  });

  const onMouseDown = useMemoFn((e: MouseEvent) => {
    if (!props.value && e.detail > 1) {
      preventNativeEvent(e);
    }
  });

  const onKeyDown = useMemoFn((e: KeyboardEvent) => {
    props.onKeydown && props.onKeydown(e);
    if (isKeyCode(e, KEY_CODE.ENTER)) {
      preventNativeEvent(e);
      return void 0;
    }
  });

  const onPaste = useMemoFn((e: ClipboardEvent) => {
    preventNativeEvent(e);
    const clipboardData = e.clipboardData;
    if (!clipboardData) return void 0;
    const text = clipboardData.getData(TEXT_PLAIN) || "";
    document.execCommand("insertText", false, text.replace(/\n/g, " "));
  });

  useEffect(() => {
    const el = editNode;
    if (!el) return void 0;
    const { INPUT, COMPOSITION_END, PASTE, KEY_DOWN, MOUSE_DOWN, COMPOSITION_START, BEFORE_INPUT } =
      EDITOR_EVENT;
    el.addEventListener(INPUT, onInput);
    el.addEventListener(PASTE, onPaste);
    el.addEventListener(KEY_DOWN, onKeyDown);
    el.addEventListener(MOUSE_DOWN, onMouseDown);
    el.addEventListener(COMPOSITION_START, onCompositionStart);
    el.addEventListener(COMPOSITION_END, onCompositionEnd);
    el.addEventListener(BEFORE_INPUT, onBeforeInput);
    return () => {
      el.removeEventListener(INPUT, onInput);
      el.removeEventListener(PASTE, onPaste);
      el.removeEventListener(KEY_DOWN, onKeyDown);
      el.removeEventListener(MOUSE_DOWN, onMouseDown);
      el.removeEventListener(COMPOSITION_START, onCompositionStart);
      el.removeEventListener(COMPOSITION_END, onCompositionEnd);
      el.removeEventListener(BEFORE_INPUT, onBeforeInput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editNode]);

  const showPlaceholder = !value && placeholder && !isComposing;

  return (
    <Isolate className={props.className} style={props.style}>
      <div
        {...{ [DATA_EDITABLE_KEY]: true }}
        ref={onEditableRef}
        className="block-kit-editable-text"
        data-vars-placeholder={showPlaceholder ? placeholder : void 0}
        contentEditable
        suppressContentEditableWarning
      ></div>
    </Isolate>
  );
};
