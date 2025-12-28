import type { Editor, LeafState } from "@block-kit/core";
import { LEAF_KEY, PLUGIN_FUNC } from "@block-kit/core";
import { SPACE } from "@block-kit/utils";
import { useForceUpdate, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import React, { useMemo } from "react";

import type { ReactLeafContext } from "../plugin/types";
import { Text } from "../preset/text";
import { rewriteRemoveChild } from "../utils/dirty-dom";
import { LEAF_TO_REMOUNT, LEAF_TO_TEXT as LT } from "../utils/weak-map";

const LeafView: FC<{
  editor: Editor;
  index: number;
  leafState: LeafState;
}> = props => {
  const { editor, leafState } = props;
  const { forceUpdate, index: renderKey } = useForceUpdate();

  /**
   * 设置叶子 DOM 节点
   */
  const setModel = useMemoFn((ref: HTMLSpanElement | null) => {
    if (ref) {
      rewriteRemoveChild(ref);
      editor.model.setLeafModel(ref, leafState);
    }
    LEAF_TO_REMOUNT.set(leafState, forceUpdate);
  });

  /**
   * 处理叶子节点的渲染
   */
  const runtime = useMemo(() => {
    const text = leafState.getText();
    const context: ReactLeafContext = {
      op: leafState.op,
      classList: [],
      lineState: leafState.parent,
      leafState: leafState,
      attributes: leafState.op.attributes,
      style: {},
      children: <Text onRef={el => el && LT.set(leafState, el)}>{text}</Text>,
    };
    const plugins = editor.plugin.getPriorityPlugins(PLUGIN_FUNC.RENDER_LEAF);
    for (const plugin of plugins) {
      if (plugin.match(context.attributes || {}, context.op)) {
        context.children = plugin.renderLeaf(context);
      }
    }
    return context;
  }, [editor.plugin, leafState]);

  return (
    <span
      key={renderKey}
      {...{ [LEAF_KEY]: true }}
      ref={setModel}
      style={runtime.style}
      className={runtime.classList.join(SPACE) || void 0}
    >
      {runtime.children}
    </span>
  );
};

/** Leaf Model */
export const LeafModel = React.memo(LeafView);
