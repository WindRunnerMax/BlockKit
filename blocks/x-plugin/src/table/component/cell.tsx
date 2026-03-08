import "../styles/cell.scss";

import { throttle } from "@block-kit/utils";
import type { ApplyChange, BlockState } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import type { JSONOp } from "@block-kit/x-json";
import { BlockXModel, BlockXWrapModel, useReadonly } from "@block-kit/x-react";
import type { FC } from "react";

import { useTableRefContext } from "../hooks/use-ref-context";
import { useTableStateContext } from "../hooks/use-state-context";
import type { TableBlockDataType } from "../types";
import { MIN_CELL_WIDTH } from "../types";

export const Cell: FC<{
  cellState: BlockState;
  rowIndex: number;
  colIndex: number;
  rowSpan: number;
  colSpan: number;
  flatIndex: number;
}> = props => {
  const { colIndex, colSpan, cellState } = props;
  const editor = cellState.container.editor;
  const { readonly } = useReadonly();
  const { config, size, state: tableState } = useTableStateContext();
  const { setClientState, refreshTableState } = useTableRefContext();
  const [, colSize] = size;

  const onResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    document.body.style.cursor = "col-resize";
    const tableStateData = tableState.data as TableBlockDataType;
    const originIndex = colIndex;
    // 在单元格横向合并情况下需要重新定位索引, 即合并的单元格右侧操作的应该是首个单元格
    const newColIndex = originIndex + colSpan - 1;
    if (newColIndex < 0 || newColIndex > colSize) return void 0;
    const configItem = config[newColIndex] || {};
    config[newColIndex] = configItem;
    const originWidth = Math.max(configItem.width || 0, MIN_CELL_WIDTH);
    const originX = event.clientX;
    const onMouseMove = throttle((e: MouseEvent) => {
      const diff = e.clientX - originX;
      if (diff === 0) return void 0;
      const newWidth = Math.max(originWidth + diff, MIN_CELL_WIDTH);
      configItem.width = newWidth;
      setClientState({ config: [...config] });
      e.stopPropagation();
    }, 16);
    const onMouseUp = (e: MouseEvent) => {
      const diff = e.clientX - originX;
      if (diff === 0) return void 0;
      const newWidth = Math.max(originWidth + diff, MIN_CELL_WIDTH);
      configItem.width = newWidth;
      setClientState({ config: [...config] });
      const cellConfigItem = tableStateData.config[newColIndex];
      let change: ApplyChange;
      if (cellConfigItem) {
        const path = ["config", newColIndex, "width"];
        change = editor.perform.atom.updateObjectAttr(tableState.id, path, newWidth);
      } else {
        const op: JSONOp = { p: ["config", newColIndex], li: { width: newWidth } };
        change = { id: tableState.id, ops: [op] };
      }
      editor.state.apply([change], { autoCaret: false });
      refreshTableState();
      document.body.style.cursor = "";
      document.removeEventListener(EDITOR_EVENT.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EDITOR_EVENT.MOUSE_UP, onMouseUp);
    };
    document.addEventListener(EDITOR_EVENT.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EDITOR_EVENT.MOUSE_UP, onMouseUp);
  };

  return (
    <td className="block-kit-x-table-td">
      <BlockXWrapModel editor={editor} state={cellState}>
        <BlockXModel editor={editor} state={cellState}></BlockXModel>
      </BlockXWrapModel>
      {!readonly && (
        <div
          contentEditable={false}
          onMouseDown={onResizeMouseDown}
          className="block-kit-x-table-cell-resize"
        ></div>
      )}
    </td>
  );
};
