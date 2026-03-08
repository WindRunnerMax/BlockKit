import "../styles/tool-cols.scss";

import { cs, preventNativeEvent } from "@block-kit/utils";
import type { RangeEntry } from "@block-kit/x-core";
import { EDITOR_EVENT, Entry, POINT_TYPE, Range } from "@block-kit/x-core";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import type { TableStateContext } from "../hooks/use-state-context";
import { MIN_CELL_WIDTH } from "../types";

export const ColTools: FC<{
  context: TableStateContext;
  scroll: React.RefObject<HTMLDivElement>;
}> = props => {
  const context = props.context;
  const { size } = context;
  const [rowSize, colSize] = size;
  const editor = context.state.container.editor;
  const container = useRef<HTMLDivElement>(null);
  const [selectedColIndex, setSelectedColIndex] = useState(-1);

  const syncScroll = () => {
    const scroll = props.scroll.current;
    const el = container.current;
    if (!el || !scroll) return void 0;
    el.scrollLeft = scroll.scrollLeft;
  };

  const onSelectColCells = (index: number) => {
    const cells = props.context.state.children;
    const entries: RangeEntry[] = [];
    for (let i = 0; i < rowSize; i++) {
      const cell = cells[i * colSize + index];
      if (!cell) continue;
      entries.push(Entry.create(cell.id, POINT_TYPE.BLOCK));
    }
    editor.selection.set(new Range(entries));
    setSelectedColIndex(index);
    const reset = () => setSelectedColIndex(-1);
    editor.event.once(EDITOR_EVENT.SELECTION_CHANGE, reset);
  };

  useEffect(() => {
    const el = props.scroll.current;
    if (!el) return void 0;
    el.addEventListener("scroll", syncScroll);
    return () => {
      el.removeEventListener("scroll", syncScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="block-kit-x-table-col-tools" ref={container}>
      {Array.from({ length: colSize }).map((_, index) => {
        // 平铺的数组是 行 X 列, 因此可以直接取首行的配置
        const config = props.context.config[index];
        const MIN_WIDTH = MIN_CELL_WIDTH;
        const width = config ? Math.max(config.width || 0, MIN_WIDTH) : MIN_WIDTH;
        return (
          <div
            onMouseDown={preventNativeEvent}
            className={cs(
              "block-kit-x-table-col-tools-item",
              selectedColIndex === index && "active"
            )}
            key={index}
            style={{ width: width + (index ? 1 : 0) }}
            onClick={() => onSelectColCells(index)}
          ></div>
        );
      })}
    </div>
  );
};
