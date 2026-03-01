import "../styles/index.scss";

import { formatListLevel } from "@block-kit/plugin";
import { useForceUpdate } from "@block-kit/utils/dist/es/hooks";
import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";

import type { XOrderStore } from "../types";

export const OrderText: FC<{
  start: number;
  store: XOrderStore;
  context: ReactBlockWrapContext;
  children: React.ReactNode;
}> = props => {
  const context = props.context;
  const state = context.state;
  const { index, forceUpdate } = useForceUpdate();

  const marker = useMemo(() => {
    let start = props.start;
    // start 值小于等于 0 时, 自动计算序号
    if (start <= 0) {
      const prev = state.prev();
      if (prev && props.store[prev.id]) {
        start = props.store[prev.id].start + 1;
      } else {
        start = 1;
      }
    }
    props.store[state.id] = { start, update: forceUpdate };
    return formatListLevel(start, state.linear - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.start, state.linear, index]);

  useEffect(() => {
    return () => {
      delete props.store[state.id];
    };
  }, [forceUpdate, props.store, state.id]);

  return (
    <div className="block-kit-x-order">
      <div className="block-kit-x-order-marker" contentEditable={false}>
        {marker}
      </div>
      {props.children}
    </div>
  );
};
