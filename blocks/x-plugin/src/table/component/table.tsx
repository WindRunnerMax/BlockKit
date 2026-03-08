import "../styles/table.scss";

import type { BlockState } from "@block-kit/x-core";
import type { FC } from "react";
import { useMemo, useRef, useState } from "react";

import { TableRefContext } from "../hooks/use-ref-context";
import { TableStateContext } from "../hooks/use-state-context";
import { MIN_CELL_WIDTH } from "../types";
import { resetTableState } from "../utils/calculate";

export const Table: FC<{
  state: BlockState;
}> = props => {
  const wrapper = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(() => resetTableState(props.state));
  const [, colSize] = state.size;

  const ref = useMemo((): TableRefContext => {
    return {
      state: props.state,
      setClientState: c => setState(o => Object.assign({}, o, c)),
      refreshTableState: () => resetTableState(props.state),
    };
  }, [props.state]);

  return (
    <div className="block-kit-x-table-wrapper" ref={wrapper}>
      <div className="block-kit-x-table-scroll">
        <table className="block-kit-x-table">
          <colgroup contentEditable={false}>
            {Array.from({ length: colSize }).map((_, index) => {
              // 平铺的数组是 行 X 列, 因此可以直接取首行的配置
              const config = state.config[index];
              const MIN_WIDTH = MIN_CELL_WIDTH;
              const width = config ? Math.max(config.width || 0, MIN_WIDTH) : MIN_WIDTH;
              return <col key={index} style={{ width }}></col>;
            })}
            <col className="block-kit-x-table-full-col"></col>
          </colgroup>
          <TableRefContext.Provider value={ref}>
            <TableStateContext.Provider value={state}>
              <tbody>{props.children}</tbody>
            </TableStateContext.Provider>
          </TableRefContext.Provider>
        </table>
      </div>
    </div>
  );
};
