import type { BlockState } from "@block-kit/x-core";
import type { FC } from "react";
import { useMemo, useRef } from "react";

import type { TableStateContext } from "../hooks/use-context";
import { TableContext } from "../hooks/use-context";
import type { TableBlockDataType } from "../types";

export const Table: FC<{
  state: BlockState;
}> = props => {
  const data = props.state.data as TableBlockDataType;
  const wrapper = useRef<HTMLDivElement>(null);

  const provider: TableStateContext = useMemo(() => {
    return {
      state: props.state,
      trs: [],
      widths: [],
      size: data.size,
    };
  }, [data.size, props.state]);

  return (
    <div className="block-kit-x-table-wrapper" ref={wrapper}>
      <div className="block-kit-x-table-scroll">
        <table className="table-block">
          <colgroup contentEditable={false}>
            {/* 额外渲染 col, 可以占满表格的剩余宽度 */}
            {/* { <col style={{ width: "100%" }}></col>} */}
          </colgroup>
          <TableContext.Provider value={provider}>
            <tbody>{props.children}</tbody>
          </TableContext.Provider>
        </table>
      </div>
    </div>
  );
};
