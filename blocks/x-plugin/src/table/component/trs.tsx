import type { FC } from "react";
import { Fragment } from "react";

import { useTableStateContext } from "../hooks/use-state-context";
import { Cell } from "./cell";

export const Trs: FC<{
  readonly: boolean;
}> = props => {
  const { readonly } = props;
  const { state, trs, size, config } = useTableStateContext();
  const [rowSize, colSize] = size;

  const onRef = (el: HTMLTableRowElement | null, index: number) => {
    el && (trs[index] = el);
  };

  const trEls: JSX.Element[] = [];

  for (let i = 0; i < rowSize; i++) {
    const cells: JSX.Element[] = [];
    for (let k = 0; k < colSize; k++) {
      const flatIndex = i * colSize + k;
      const configItem = config[flatIndex] || {};
      const cellState = state.children[flatIndex];
      cells.push(
        <Cell
          readonly={readonly}
          key={cellState.id}
          cellState={cellState}
          rowIndex={i}
          colIndex={k}
          flatIndex={flatIndex}
          rowSpan={configItem.rowSpan || 1}
          colSpan={configItem.colSpan || 1}
        />
      );
    }
    trEls.push(
      <tr key={i} className="block-kit-x-table-tr" ref={e => onRef(e, i)}>
        {cells}
      </tr>
    );
  }

  return <Fragment>{trEls}</Fragment>;
};
