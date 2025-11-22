import type { Editor } from "@block-kit/core";
import { EDITOR_STATE } from "@block-kit/core";
import type { BlockEditor } from "@block-kit/x-core";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";

import { BlockKitContext } from "../hooks/use-editor";
import { MetaContext } from "../hooks/use-meta";
import { ReadonlyContext } from "../hooks/use-readonly";
import { PortalModel } from "../model/portal";

export type BlockKitProps = {
  editor: BlockEditor;
  readonly?: boolean;
  children?: ReactNode;
  onCreateTextEditor: () => Editor;
};

export const BlockKitX: React.FC<BlockKitProps> = props => {
  const { editor, readonly, children } = props;

  if (editor.state.get(EDITOR_STATE.READONLY) !== readonly) {
    editor.state.set(EDITOR_STATE.READONLY, readonly || false);
  }

  const onCreateTextEditorRef = useRef(props.onCreateTextEditor);
  onCreateTextEditorRef.current = props.onCreateTextEditor;

  const meta = useMemo(() => {
    return {
      onCreateTextEditor: onCreateTextEditorRef.current,
    };
  }, []);

  return (
    <BlockKitContext.Provider value={editor}>
      <ReadonlyContext.Provider value={!!readonly}>
        <MetaContext.Provider value={meta}>
          <PortalModel editor={editor}></PortalModel>
          {children}
        </MetaContext.Provider>
      </ReadonlyContext.Provider>
    </BlockKitContext.Provider>
  );
};
