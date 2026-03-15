import "../styles/table.scss";

import { cs } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { BlockState } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import { useReadonly } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useFocusedInState } from "../../shared/hooks/use-focus-in";
import { TableRefContext } from "../hooks/use-ref-context";
import { TableStateContext } from "../hooks/use-state-context";
import { MIN_CELL_WIDTH } from "../types";
import { resetTableState } from "../utils/calculate";
import { ColTools } from "./tool-cols";
import { RowTools } from "./tool-rows";
import { Trs } from "./trs";

export const Table: FC<{
  state: BlockState;
}> = props => {
  const wrapper = useRef<HTMLDivElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState(() => resetTableState(props.state));
  const { readonly } = useReadonly();
  const { isFocused } = useFocusedInState(props.state);
  const [, colSize] = context.size;
  const editor = props.state.container.editor;

  const ref = useMemo((): TableRefContext => {
    return {
      anchorCell: null,
      state: props.state,
      setClientState: c => setContext(o => Object.assign({}, o, c)),
      refreshTableState: () => resetTableState(props.state),
    };
  }, [props.state]);

  const onMouseUp = useMemoFn(() => {
    ref.anchorCell = null;
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, onMouseUp);
    return () => {
      editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, onMouseUp);
    };
  }, [editor.event, onMouseUp]);

  return (
    <div className="block-kit-x-table-wrapper" ref={wrapper}>
      <div className="block-kit-x-table-scroll" ref={scroll}>
        <table className="block-kit-x-table">
          <colgroup contentEditable={false}>
            {Array.from({ length: colSize }).map((_, index) => {
              // 平铺的数组是 行 X 列, 因此可以直接取首行的配置
              const config = context.config[index];
              const MIN_WIDTH = MIN_CELL_WIDTH;
              const width = config ? Math.max(config.width || 0, MIN_WIDTH) : MIN_WIDTH;
              return <col key={index} style={{ width }}></col>;
            })}
            <col className="block-kit-x-table-full-col"></col>
          </colgroup>
          <TableRefContext.Provider value={ref}>
            <TableStateContext.Provider value={context}>
              <tbody>
                <Trs readonly={readonly} />
              </tbody>
            </TableStateContext.Provider>
          </TableRefContext.Provider>
        </table>
      </div>
      {!readonly && (
        <div
          className={cs("block-kit-x-table-tools", isFocused && "active")}
          contentEditable={false}
        >
          <ColTools context={context} scroll={scroll}></ColTools>
          <RowTools context={context} wrapper={wrapper}></RowTools>
        </div>
      )}
    </div>
  );
};
