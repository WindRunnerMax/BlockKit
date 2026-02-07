import "../styles/index.scss";

import { debounce, preventNativeEvent } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { BlockEditor, Listener } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import type { BlockModule } from "@block-kit/x-json";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXModel, MountNode, useReadonly } from "@block-kit/x-react";
import type { FC, ReactNode } from "react";
import { useEffect, useMemo } from "react";

import { Selector } from "../../shared/component/selector";
import { DEFAULT_LANGUAGE, SELECTOR_ID, SUPPORTED_LANGUAGES } from "../utils/constant";

export const CodeBlock: FC<{
  editor: BlockEditor;
  context: ReactBlockContext;
}> = props => {
  const { editor, context } = props;
  const state = context.state;
  const { readonly } = useReadonly();
  const data = context.state.data as BlockModule["code"];

  const onParse = useMemoFn(() => {
    const lang = data.language || DEFAULT_LANGUAGE;
    const ops = data.delta || [];
    const code = ops.map(op => op.insert).join("");
    import("../utils/parser").then(m => {
      const now = Date.now();
      const delta = m.tokenize(code, lang);
      const change = editor.perform.atom.updateText(state.id, delta);
      editor.state.apply([change], { autoCaret: false, undoable: false, client: true });
      editor.logger.debug("Tokenize Code Cost:", Date.now() - now + "ms");
    });
  });

  const onDebounceParse = useMemo(() => {
    return debounce(onParse, 200);
  }, [onParse]);

  const onContentChange: Listener<"CONTENT_CHANGE"> = useMemoFn(e => {
    if (!e.changes[state.id] || e.options.client) return void 0;
    onDebounceParse();
  });

  useEffect(() => {
    onDebounceParse();
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor.event, onContentChange, onDebounceParse]);

  const onLanguageChange = useMemoFn((value: string) => {
    const change = editor.perform.atom.updateAttr(state.id, ["language"], value);
    editor.state.apply([change], { autoCaret: false });
  });

  const mountSelector = useMemoFn((node: ReactNode) => {
    MountNode.mount(props.editor, SELECTOR_ID, node);
  });

  const unmountSelector = useMemoFn(() => {
    MountNode.unmount(props.editor, SELECTOR_ID);
  });

  return (
    <div className="block-kit-x-codeblock">
      <div
        contentEditable={false}
        className="block-kit-x-codeblock-langs"
        onMouseDown={preventNativeEvent}
      >
        <Selector
          disabled={readonly}
          defaultValue={data.language || DEFAULT_LANGUAGE}
          onChange={value => onLanguageChange(value)}
          options={SUPPORTED_LANGUAGES}
          onMount={mountSelector}
          onUnmount={unmountSelector}
        ></Selector>
      </div>
      <BlockXModel editor={editor} state={context.state}></BlockXModel>
    </div>
  );
};
