import type { Editor, LineState } from "@block-kit/core";
import { EDITOR_EVENT, EDITOR_STATE } from "@block-kit/core";
import type { FC } from "react";
import React, { useEffect, useLayoutEffect } from "react";

const PaintEffectView: FC<{ editor: Editor; lines: LineState[] }> = props => {
  const editor = props.editor;

  /**
   * 视图更新需要重新设置选区 无依赖数组
   */
  useLayoutEffect(() => {
    const selection = editor.selection.get();
    // 同步计算完成后更新浏览器选区, 等待 Paint
    if (editor.state.isFocused() && selection) {
      editor.logger.debug("UpdateDOMSelection");
      editor.selection.updateDOMSelection(true);
    }
  });

  /**
   * 视图更新需要触发视图绘制完成事件 无依赖数组
   * state  -> parent -> node -> child ->|
   * effect <- parent <- node <- child <-|
   */
  useEffect(() => {
    editor.logger.debug("OnPaint");
    editor.state.set(EDITOR_STATE.PAINTING, false);
    Promise.resolve().then(() => {
      editor.event.trigger(EDITOR_EVENT.PAINT, {});
    });
  });

  return null;
};

/**
 * 副作用依赖视图
 * - 父组件渲染会引发子组件渲染问题, memo 并未严格控制对比, 例如 ph 变更会导致重渲染
 * - 避免 memo 的渲染穿透问题, 参考 packages/react/test/render/effect.test.tsx
 * - 同样也可以直接将依赖即 [lines] 作为以来放置于 effect 中, 但抽离出独立组件能够更清晰
 * - 不过其实抽离出 Hook 更清晰, 组件实现方式需要保证组件渲染顺序, 否则会导致选区刷新问题
 */
export const PaintEffectModel = React.memo(PaintEffectView);
