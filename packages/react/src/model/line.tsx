import type { Editor, LineState } from "@block-kit/core";
import { CALLER_TYPE, NODE_KEY, PLUGIN_FUNC } from "@block-kit/core";
import { EOL, EOL_OP } from "@block-kit/delta";
import { SPACE } from "@block-kit/utils";
import { useUpdateEffect, useUpdateLayoutEffect } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import React, { useMemo } from "react";

import { withWrapLeafNodes } from "../plugin/modules/wrap";
import type { ReactLineContext } from "../plugin/types";
import { rewriteRemoveChild, updateDirtyLeaf, updateDirtyText } from "../utils/dirty-dom";
import { JSX_TO_STATE } from "../utils/weak-map";
import { EOLModel } from "./eol";
import { LeafModel } from "./leaf";

const LineView: FC<{
  editor: Editor;
  lineState: LineState;
}> = props => {
  const { editor, lineState } = props;

  /**
   * 设置行 DOM 节点
   */
  const setModel = (ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setLineModel(ref, lineState);
      rewriteRemoveChild(ref);
    }
  };

  /**
   * 编辑器行结构布局计算后同步调用
   * - 首次处理会将所有 DOM 渲染, 不需要执行脏数据检查
   * - 需要 LayoutEffect 以保证 DOM -> Sel 的执行顺序
   */
  useUpdateLayoutEffect(() => {
    const leaves = lineState.getLeaves();
    // 在 OnRef 回调时会设置 Leaf 映射的相关 DOM 节点以及方法等
    // OnRef 调用时机在 LayoutEffect 前, 可以在此处进行脏数据检查
    for (const leaf of leaves) {
      updateDirtyText(leaf);
      updateDirtyLeaf(editor, leaf);
    }
    editor.plugin.call(CALLER_TYPE.WILL_PAINT_LINE_STATE, lineState);
  }, [lineState]);

  /**
   * 编辑器行结构布局计算后异步调用
   */
  useUpdateEffect(() => {
    editor.plugin.call(CALLER_TYPE.DID_PAINT_LINE_STATE, lineState);
  }, [lineState]);

  /**
   * 处理行内的节点
   */
  const elements = useMemo(() => {
    // 开发模式下严格检查数据准确性
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      const leaves = lineState.getLeaves();
      for (const leaf of leaves) {
        if (leaf.index === -1 || leaf.offset === -1 || !leaf.key) {
          throw new Error("LeafState index or offset is not set");
        }
      }
    }
    const leaves = lineState.getLeaves();
    // 首先渲染所有非 EOL 的叶子节点
    const textLeaves = leaves.slice(0, -1);
    const nodes = textLeaves.map(n => {
      const node = <LeafModel key={n.key} editor={editor} leafState={n} />;
      JSX_TO_STATE.set(node, n);
      return node;
    });
    // 存在内容时不渲染 EOL, 避免块级元素出现额外视觉上的换行
    // 若是空行则仅存在一个 Leaf, 此时需要渲染空的占位节点
    if (!nodes.length && leaves[0]) {
      const leaf = leaves[0];
      const node = <EOLModel key={EOL} editor={editor} leafState={leaf} />;
      JSX_TO_STATE.set(node, leaf) && nodes.push(node);
      return nodes;
    }
    // inline-void(embed) 在行未时需要预设零宽字符来放置光标
    const eolLeaf = leaves[leaves.length - 1];
    const lastLeaf = textLeaves[textLeaves.length - 1];
    if (lastLeaf && eolLeaf && lastLeaf.embed) {
      const node = <EOLModel key={EOL} editor={editor} leafState={eolLeaf} />;
      JSX_TO_STATE.set(node, eolLeaf) && nodes.push(node);
      return nodes;
    }
    return nodes;
  }, [editor, lineState]);

  /**
   * 将行内叶子节点包装组合 O(N)
   */
  const children = useMemo(() => {
    return withWrapLeafNodes(editor, elements);
  }, [editor, elements]);

  /**
   * 处理行级节点的渲染
   */
  const runtime = useMemo(() => {
    const context: ReactLineContext = {
      classList: [],
      lineState: lineState,
      attributes: lineState.attributes,
      style: {},
      children,
    };
    const plugins = editor.plugin.getPriorityPlugins(PLUGIN_FUNC.RENDER_LINE);
    for (const plugin of plugins) {
      const op = { ...EOL_OP, attributes: context.attributes };
      if (plugin.match(context.attributes, op)) {
        context.children = plugin.renderLine(context);
      }
    }
    return context;
  }, [children, editor.plugin, lineState]);

  return (
    <div
      {...{ [NODE_KEY]: true }}
      ref={setModel}
      dir="auto"
      style={runtime.style}
      className={runtime.classList.join(SPACE) || void 0}
    >
      {runtime.children}
    </div>
  );
};

/** Line Model */
export const LineModel = React.memo(LineView);
