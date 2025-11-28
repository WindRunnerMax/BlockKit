import { EDITOR_EVENT } from "@block-kit/core";
import { Isolate, useEditorStatic, useReadonly } from "@block-kit/react";
import {
  isDOMText,
  isKeyCode,
  isNil,
  KEY_CODE,
  NOOP,
  preventNativeEvent,
  TEXT_PLAIN,
} from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { O } from "@block-kit/utils/dist/es/types";
import type { FC } from "react";
import React, { useEffect, useRef, useState } from "react";

import { DATA_EDITABLE_KEY } from "../utils/constant";
import { onLeftArrowKey, onRightArrowKey, onTabKey } from "../utils/event";

export const EditableTextInput: FC<{
  value: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onRef?: (ref: HTMLDivElement | null) => void;
  onChange?: (value: string, event: InputEvent) => void;
  onBeforeInput?: (event: InputEvent) => void;
}> = props => {
  const { onChange = NOOP, value, placeholder } = props;
  const { editor } = useEditorStatic();
  const { readonly } = useReadonly();
  const [isComposing, setIsComposing] = useState(false);
  const [editNode, setEditNode] = useState<HTMLDivElement | null>(null);

  const onEditableRef = (ref: HTMLDivElement | null) => {
    props.onRef && props.onRef(ref);
    ref && setEditNode(ref);
  };

  useEffect(() => {
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

  const onInput = useMemoFn((e: Event) => {
    if ((e as O.Any).isComposing || isNil(editNode)) {
      return void 0;
    }
    const newValue = editNode.textContent || "";
    newValue !== value && onChange(newValue, e as InputEvent);
  });

  const onMouseDown = useMemoFn((e: MouseEvent) => {
    if (!props.value && e.detail > 1) {
      preventNativeEvent(e);
    }
  });

  const onKeyDown = useMemoFn((e: KeyboardEvent) => {
    if (isKeyCode(e, KEY_CODE.ENTER)) {
      preventNativeEvent(e);
      return void 0;
    }
    const sel = window.getSelection();
    if (sel && sel.isCollapsed) {
      isKeyCode(e, KEY_CODE.TAB) && onTabKey(editor, sel, e);
      !readonly && isKeyCode(e, KEY_CODE.LEFT) && onLeftArrowKey(sel, e);
      !readonly && isKeyCode(e, KEY_CODE.RIGHT) && onRightArrowKey(props.value, sel, e);
    }
  });

  const onCompositionStart = useMemoFn(() => {
    setIsComposing(true);
  });

  const onCompositionEnd = useMemoFn((e: CompositionEvent) => {
    setIsComposing(false);
    onInput(e);
  });

  const onPaste = useMemoFn((e: ClipboardEvent) => {
    preventNativeEvent(e);
    const clipboardData = e.clipboardData;
    if (!clipboardData) return void 0;
    const text = clipboardData.getData(TEXT_PLAIN) || "";
    document.execCommand("insertText", false, text.replace(/\n/g, " "));
  });

  const onBeforeInputRef = useRef(props.onBeforeInput);

  useEffect(() => {
    const el = editNode;
    if (!el) return void 0;
    const onBeforeInput = onBeforeInputRef.current;
    const { INPUT, COMPOSITION_END, PASTE, KEY_DOWN, MOUSE_DOWN, COMPOSITION_START, BEFORE_INPUT } =
      EDITOR_EVENT;
    el.addEventListener(INPUT, onInput);
    el.addEventListener(PASTE, onPaste);
    el.addEventListener(KEY_DOWN, onKeyDown);
    el.addEventListener(MOUSE_DOWN, onMouseDown);
    el.addEventListener(COMPOSITION_START, onCompositionStart);
    el.addEventListener(COMPOSITION_END, onCompositionEnd);
    onBeforeInput && el.addEventListener(BEFORE_INPUT, onBeforeInput);
    return () => {
      el.removeEventListener(INPUT, onInput);
      el.removeEventListener(PASTE, onPaste);
      el.removeEventListener(KEY_DOWN, onKeyDown);
      el.removeEventListener(MOUSE_DOWN, onMouseDown);
      el.removeEventListener(COMPOSITION_START, onCompositionStart);
      el.removeEventListener(COMPOSITION_END, onCompositionEnd);
      onBeforeInput && el.removeEventListener(BEFORE_INPUT, onBeforeInput);
    };
  }, [onInput, onKeyDown, onMouseDown, editNode, onPaste, onCompositionStart, onCompositionEnd]);

  const showPlaceholder = !value && placeholder && !isComposing;

  return (
    <Isolate className={props.className} style={props.style}>
      <div
        {...{ [DATA_EDITABLE_KEY]: true }}
        className="block-kit-editable-text"
        ref={onEditableRef}
        data-vars-placeholder={showPlaceholder ? placeholder : void 0}
        contentEditable
        suppressContentEditableWarning
      ></div>
    </Isolate>
  );
};
