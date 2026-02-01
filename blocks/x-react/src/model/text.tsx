import { Editor as TextEditor } from "@block-kit/core";
import { EDITOR_EVENT, EDITOR_STATE } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { BlockKitContext, LineModel, rewriteRemoveChild } from "@block-kit/react";
import { useMemoFn, useSafeState } from "@block-kit/utils/dist/es/hooks";
import type { BlockEditor, BlockState, CreateTextEditorContext, Listener } from "@block-kit/x-core";
import { X_TEXT_BLOCK_KEY } from "@block-kit/x-core";
import { isTextDeltaOp } from "@block-kit/x-json";
import type { FC } from "react";
import React, { useLayoutEffect, useMemo, useRef } from "react";

const TextView: FC<{
  block: BlockEditor;
  state: BlockState;
  className?: string;
}> = props => {
  const editor = useMemo(() => {
    const ops = props.state.data.delta;
    const context: CreateTextEditorContext = {
      state: props.state,
      delta: new Delta(ops),
    };
    let instance: TextEditor | null = null;
    const pluginMap = props.block.plugin.map;
    let plugin = pluginMap[props.state.type];
    if (!plugin || !plugin.willCreateTextEditor) {
      plugin = pluginMap.text;
    }
    if (plugin && plugin.willCreateTextEditor) {
      instance = plugin.willCreateTextEditor(context);
    }
    if (!instance) {
      instance = new TextEditor({
        delta: context.delta,
        schema: props.block.schema.textSchema,
      });
    }
    props.block.model.setTextEditor(props.state, instance);
    return instance;
  }, [props.block, props.state]);

  const flushing = useRef(false);
  const state = editor.state.block;
  const [lines, setLines] = useSafeState(() => state.getLines());

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
      if (!isTextDeltaOp(op)) continue;
      isAppliedDelta = true;
      editor.state.apply(new Delta(op.o), { autoCaret: false, undoable: false });
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
    return lines.map(line => {
      return <LineModel key={line.key} editor={editor} lineState={line}></LineModel>;
    });
  }, [editor, lines]);

  return (
    <BlockKitContext.Provider value={editor}>
      <div {...{ [X_TEXT_BLOCK_KEY]: true }} ref={setModel} className={props.className}>
        {elements}
      </div>
    </BlockKitContext.Provider>
  );
};

/** Text Model */
export const TextModel = React.memo(TextView);
