import "../styles/selector.scss";

import { IconDown } from "@arco-design/web-react/icon";
import { cs, stopNativeEvent } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import { EDITOR_EVENT } from "@block-kit/x-core";
import type { FC, ReactNode } from "react";
import { useRef, useState } from "react";

export const Selector: FC<{
  disabled?: boolean;
  className?: string;
  defaultValue: string;
  options: string[];
  onChange: (value: string) => void;
  onMount: (node: ReactNode) => void;
  onUnmount: () => void;
  children?: never;
}> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeOptions = useMemoFn(() => {
    setIsOpen(false);
    props.onUnmount();
  });

  const onTrigger = (e: React.MouseEvent) => {
    stopNativeEvent(e);
    if (isOpen) {
      closeOptions();
      return void 0;
    }
    setIsOpen(true);
    const Options = (
      <div onClick={stopNativeEvent}>
        {props.options.map((item, index) => (
          <div key={index} className="block-kit-x-selector-options">
            {item}
          </div>
        ))}
      </div>
    );
    props.onMount(Options);
    document.addEventListener(EDITOR_EVENT.CLICK, closeOptions, { once: true });
  };

  return (
    <div ref={ref} className={cs("block-kit-x-selector", props.className)} onClick={onTrigger}>
      {props.defaultValue}
      {!props.disabled && <IconDown style={{ transform: isOpen ? "rotate(180deg)" : undefined }} />}
    </div>
  );
};
