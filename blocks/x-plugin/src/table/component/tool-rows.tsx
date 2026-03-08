import "../styles/tool-rows.scss";

import type { ResizeRect } from "@block-kit/utils";
import { cs, preventNativeEvent } from "@block-kit/utils";
import { Resize } from "@block-kit/utils";
import type { RangeEntry } from "@block-kit/x-core";
import { EDITOR_EVENT, Entry, POINT_TYPE, Range } from "@block-kit/x-core";
import type { FC } from "react";
import { useEffect, useState } from "react";

import type { TableStateContext } from "../hooks/use-state-context";

export const RowTools: FC<{
  context: TableStateContext;
  wrapper: React.RefObject<HTMLDivElement>;
}> = props => {
  const { wrapper, context } = props;
  const [, colSize] = context.size;
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const editor = context.state.container.editor;
  const [heights, setHeights] = useState<number[]>([]);

  const onSelectRowCells = (index: number) => {
    const cells = context.state.children;
    const entries: RangeEntry[] = [];
    for (let i = 0; i < colSize; i++) {
      const cell = cells[colSize * index + i];
      if (!cell) continue;
      entries.push(Entry.create(cell.id, POINT_TYPE.BLOCK));
    }
    editor.selection.set(new Range(entries));
    setSelectedRowIndex(index);
    const reset = () => setSelectedRowIndex(-1);
    editor.event.once(EDITOR_EVENT.SELECTION_CHANGE, reset);
  };

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return void 0;
    const onResize = (prev?: ResizeRect, next?: ResizeRect) => {
      if (prev && next && prev.height === next.height) return void 0;
      // 此处该节点的宽度是满宽度即 100% , 在主文档宽度不变的情况下只会触发高度的变更观察
      const tbody = el.querySelector("tbody");
      if (!tbody) return void 0;
      const trs = Array.from(tbody.children).filter(node => {
        return node instanceof HTMLTableRowElement;
      });
      context.trs.length = trs.length;
      const newHeights: number[] = [];
      trs.forEach((tr, index) => {
        if (!tr) return void 0;
        const height = tr.getBoundingClientRect().height;
        // 主动保持 trs 和 element.children 一致
        context.trs[index] = tr as HTMLTableRowElement;
        newHeights[index] = height;
      });
      setHeights(newHeights);
    };
    onResize();
    const resize = new Resize(el, onResize);
    resize.connect();
    return () => {
      resize.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="block-kit-x-table-row-tools">
      {heights.map((height, index) => {
        return (
          <div
            onMouseDown={preventNativeEvent}
            className={cs(
              "block-kit-x-table-row-tools-item",
              selectedRowIndex === index && "active"
            )}
            key={index}
            style={{ height: height + (index ? 1 : -1) }}
            onClick={() => onSelectRowCells(index)}
          ></div>
        );
      })}
    </div>
  );
};
