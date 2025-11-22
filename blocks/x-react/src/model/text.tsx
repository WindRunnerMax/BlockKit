import { Delta } from "@block-kit/delta";
import { BlockKit, BlockModel } from "@block-kit/react";
import type { BlockState } from "@block-kit/x-core";
import type { FC } from "react";
import React, { useMemo, useRef } from "react";

import { useMetaStatic } from "../hooks/use-meta";

/**
 * Text Model
 * @param props
 */
const TextView: FC<{
  state: BlockState;
}> = props => {
  const { onCreateTextEditor } = useMetaStatic();
  const onCreateTextEditorRef = useRef(onCreateTextEditor);
  onCreateTextEditorRef.current = onCreateTextEditor;

  const editor = useMemo(() => {
    const delta = new Delta(props.state.data.delta);
    return onCreateTextEditorRef.current(delta);
  }, [props.state]);

  return (
    <BlockKit editor={editor}>
      <BlockModel editor={editor} state={editor.state.block}></BlockModel>
    </BlockKit>
  );
};

export const TextModel = React.memo(TextView);
