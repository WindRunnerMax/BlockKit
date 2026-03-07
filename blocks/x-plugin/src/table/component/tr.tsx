import type { FC } from "react";

import { useTableContext } from "../hooks/use-context";

export const Tr: FC<{ index: number }> = props => {
  const { trs } = useTableContext();

  const onRef = (el: HTMLTableRowElement) => {
    el && (trs[props.index] = el);
  };

  return (
    <tr className="block-kit-x-table-tr" ref={onRef}>
      {props.children}
    </tr>
  );
};
