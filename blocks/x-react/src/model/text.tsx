import { EDITOR_EVENT, EDITOR_STATE } from "@block-kit/core";
import { cloneOp, Delta, EOL_OP } from "@block-kit/delta";
import { BlockKit, LineModel, rewriteRemoveChild } from "@block-kit/react";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { BlockEditor, BlockState, Listener } from "@block-kit/x-core";
import { X_TEXT_BLOCK_KEY } from "@block-kit/x-core";
import type { FC } from "react";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

import { useMetaStatic } from "../hooks/use-meta";

/**
 * Text Model
 * @param props
 */
const TextView: FC<{
  block: BlockEditor;
  state: BlockState;
}> = props => {
  const { onCreateTextEditor } = useMetaStatic();
  const onCreateTextEditorRef = useRef(onCreateTextEditor);
  onCreateTextEditorRef.current = onCreateTextEditor;

  const editor = useMemo(() => {
    const ops = props.state.data.delta;
    const delta = ops && ops.length ? props.state.data.delta : [cloneOp(EOL_OP)];
    const text = onCreateTextEditorRef.current(new Delta(delta));
    props.block.model.setTextEditor(props.state, text);
    return text;
  }, [props.block.model, props.state]);

  const flushing = useRef(false);
  const state = editor.state.block;
  const [lines, setLines] = useState(() => state.getLines());

  /**
   * 设置 Block DOM 节点
   */
  const setModel = useMemoFn((ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setBlockModel(ref, state);
      rewriteRemoveChild(ref);
    }
  });

  /**
   * 数据同步变更, 异步批量绘制变更
   */
  const onContentChange: Listener<"CONTENT_CHANGE"> = useMemoFn(e => {
    const ops = e.changes[props.state.id];
    if (!ops) return void 0;
    let isAppliedDelta = false;
    for (const op of ops) {
      if (op.p[0] === "delta" && op.t === "delta" && op.o) {
        isAppliedDelta = true;
        editor.state.apply(new Delta(op.o), { autoCaret: false });
      }
    }
    if (!isAppliedDelta || flushing.current) return void 0;
    flushing.current = true;
    Promise.resolve().then(() => {
      flushing.current = false;
      setLines(state.getLines());
      editor.state.set(EDITOR_STATE.PAINTING, true);
    });
  });

  /**
   * 监听内容变更事件, 更新当前块视图
   */
  useLayoutEffect(() => {
    props.block.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    return () => {
      props.block.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [props.block.event, onContentChange]);

  /**
   * 处理行节点
   */
  const elements = useMemo(() => {
    return lines.map((line, index) => {
      const node = (
        <LineModel key={line.key} editor={editor} lineState={line} index={index}></LineModel>
      );
      return node;
    });
  }, [editor, lines]);

  return (
    <BlockKit editor={editor}>
      <div {...{ [X_TEXT_BLOCK_KEY]: true }} ref={setModel}>
        {elements}
      </div>
    </BlockKit>
  );
};

export const TextModel = React.memo(TextView);
