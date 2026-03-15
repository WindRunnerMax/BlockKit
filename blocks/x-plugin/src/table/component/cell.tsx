import "../styles/cell.scss";

import { cs, preventNativeEvent, throttle } from "@block-kit/utils";
import { useMemoFn, useSafeState } from "@block-kit/utils/dist/es/hooks";
import type { ApplyChange, BlockState, SelectionChangeEvent } from "@block-kit/x-core";
import type { RangeEntry } from "@block-kit/x-core";
import { EDITOR_EVENT, EDITOR_STATE, POINT_TYPE, Range } from "@block-kit/x-core";
import { Entry } from "@block-kit/x-core";
import { BlockXModel, BlockXWrapModel } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect } from "react";

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
  readonly: boolean;
}> = props => {
  const { colIndex, colSpan, cellState, readonly, rowIndex, rowSpan } = props;
  const editor = cellState.container.editor;
  const { config, size, state: tableState } = useTableStateContext();
  const refState = useTableRefContext();
  const [selected, setSelected] = useSafeState(false);
  const [, colSize] = size;
  const { setClientState, refreshTableState } = refState;

  const onResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    preventNativeEvent(event);
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
      preventNativeEvent(e);
      const newWidth = Math.max(originWidth + diff, MIN_CELL_WIDTH);
      configItem.width = newWidth;
      setClientState({ config: [...config] });
    }, 16);
    const onMouseUp = (e: MouseEvent) => {
      const diff = e.clientX - originX;
      if (diff === 0) return void 0;
      preventNativeEvent(e);
      const newWidth = Math.max(originWidth + diff, MIN_CELL_WIDTH);
      configItem.width = newWidth;
      setClientState({ config: [...config] });
      const cellConfigItem = tableStateData.config[newColIndex];
      let change: ApplyChange;
      if (cellConfigItem) {
        const path = ["config", newColIndex, "width"];
        change = editor.perform.atom.updateObjectAttr(tableState.id, path, newWidth);
      } else {
        const path = ["config", newColIndex];
        change = editor.perform.atom.updateObjectAttr(tableState.id, path, { width: newWidth });
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

  const onCellMouseDown = useMemoFn(() => {
    if (props.readonly) return void 0;
    refState.anchorCell = [rowIndex, colIndex, rowSpan, colSpan];
  });

  const onCellMouseEnter = useMemoFn((e: React.MouseEvent<HTMLElement>) => {
    const isMouseDown = editor.state.get(EDITOR_STATE.MOUSE_DOWN);
    if (!isMouseDown || props.readonly || !refState.anchorCell || !rowSpan || !colSpan) {
      return void 0;
    }
    preventNativeEvent(e);
    const [anchorRow, anchorCol, anchorRowSpan, anchorColSpan] = refState.anchorCell;
    const maxFocusRowIndex = rowIndex + rowSpan - 1;
    const maxFocusColIndex = colIndex + colSpan - 1;
    const maxAnchorRowIndex = anchorRow + anchorRowSpan - 1;
    const maxAnchorColIndex = anchorCol + anchorColSpan - 1;
    const minRow = Math.min(anchorRow, rowIndex, maxFocusRowIndex, maxAnchorRowIndex);
    const minCol = Math.min(anchorCol, colIndex, maxFocusColIndex, maxAnchorColIndex);
    const maxRow = Math.max(anchorRow, rowIndex, maxFocusRowIndex, maxAnchorRowIndex);
    const maxCol = Math.max(anchorCol, colIndex, maxFocusColIndex, maxAnchorColIndex);
    const entries: RangeEntry[] = [];
    for (let i = minRow; i <= maxRow; i++) {
      for (let k = minCol; k <= maxCol; k++) {
        const index = i * colSize + k;
        const children = tableState.data.children;
        const entry = Entry.create(children[index], POINT_TYPE.BLOCK);
        entries.push(entry);
      }
    }
    editor.selection.focusOnSelectionElement();
    editor.selection.set(new Range(entries));
  });

  const onSelectionChange = useMemoFn((e: SelectionChangeEvent) => {
    const { current } = e;
    const entry = current && current.map[cellState.id];
    const isSelected = entry && entry.type === POINT_TYPE.BLOCK;
    setSelected(!!isSelected);
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    };
  }, [editor.event, onSelectionChange]);

  return (
    <td
      onMouseDown={onCellMouseDown}
      onMouseEnter={onCellMouseEnter}
      className={cs("block-kit-x-table-td", selected && "block-kit-x-selected")}
    >
      <BlockXWrapModel editor={editor} state={cellState} preventSelectionCover>
        <BlockXModel editor={editor} state={cellState}></BlockXModel>
      </BlockXWrapModel>
      {!readonly && (
        <div
          contentEditable={false}
          onMouseDown={onResizeMouseDown}
          className="block-kit-x-table-cell-resize"
        ></div>
      )}
      {selected && <div className="block-kit-x-selected-cover" contentEditable={false} />}
    </td>
  );
};
