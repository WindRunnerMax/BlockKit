import type { Editor } from "@block-kit/core";
import { EDITOR_STATE } from "@block-kit/core";
import { Fragment, useMemo } from "react";

import { BlockKitContext } from "../hooks/use-editor";
import { ReadonlyContext } from "../hooks/use-readonly";
import { PortalModel } from "../model/portal";
import { initWrapPlugins } from "../plugin/modules/wrap";

export const BlockKit: React.FC<{ editor: Editor; readonly?: boolean }> = props => {
  const { editor, readonly, children } = props;

  if (editor.state.get(EDITOR_STATE.READONLY) !== readonly) {
    editor.state.set(EDITOR_STATE.READONLY, readonly || false);
  }

  useMemo(() => {
    // 希望在 Editor 初始化后立即执行一次
    initWrapPlugins(editor);
  }, [editor]);

  return (
    <Fragment>
      <PortalModel editor={editor}></PortalModel>
      <BlockKitContext.Provider value={editor}>
        <ReadonlyContext.Provider value={!!readonly}>{children}</ReadonlyContext.Provider>
      </BlockKitContext.Provider>
    </Fragment>
  );
};
