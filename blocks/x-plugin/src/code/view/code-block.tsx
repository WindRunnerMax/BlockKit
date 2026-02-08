import "../styles/index.scss";

import { useDebounceMemoFn } from "@block-kit/react";
import { isDOMElement, preventNativeEvent } from "@block-kit/utils";
import { useForceUpdate, useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { BlockEditor, Listener } from "@block-kit/x-core";
import { EDITOR_EVENT } from "@block-kit/x-core";
import type { BlockModule } from "@block-kit/x-json";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXModel, useReadonly } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect } from "react";

import { Selector } from "../../shared/component/selector";
import {
  CODE_HL_LINE_NUM,
  CODE_SELECTOR_ID,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../utils/constant";
import { restoreSelectionMarks } from "../utils/parser";

export const CodeBlock: FC<{
  editor: BlockEditor;
  context: ReactBlockContext;
}> = props => {
  const { editor, context } = props;
  const state = context.state;
  const { readonly } = useReadonly();
  const { index, forceUpdate } = useForceUpdate();
  const data = context.state.data as BlockModule["code"];

  /** 防抖解析代码高亮 */
  const onDebounceParse = useDebounceMemoFn(() => {
    const lang = data.language || DEFAULT_LANGUAGE;
    const ops = data.delta || [];
    const code = ops.map(op => op.insert).join("");
    import("../utils/parser").then(m => {
      const now = Date.now();
      const delta = m.tokenize(code, lang);
      const change = editor.perform.atom.updateText(state.id, delta);
      editor.state.apply([change], { autoCaret: false, undoable: false, client: true });
      restoreSelectionMarks(editor, state, delta);
      editor.logger.debug("Tokenize Code Cost:", Date.now() - now + "ms");
    });
  }, 200);

  const onContentChange: Listener<"CONTENT_CHANGE"> = useMemoFn(e => {
    if (!e.changes[state.id] || e.options.client) return void 0;
    onDebounceParse();
    forceUpdate();
  });

  useEffect(() => {
    onDebounceParse();
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor.event, onContentChange, onDebounceParse]);

  /** 更新行号 */
  useEffect(() => {
    const text = editor.model.getTextEditor(state);
    const lines = text && text.state.block.getLines();
    if (!lines || !text) return void 0;
    lines.forEach((line, i) => {
      const dom = text.model.getLineNode(line);
      if (dom && dom.firstChild && isDOMElement(dom.firstChild)) {
        const el = dom.firstChild as HTMLElement;
        el && el.setAttribute(CODE_HL_LINE_NUM, String(i + 1));
      }
    });
  }, [editor.model, state, index]);

  const onLanguageChange = useMemoFn((value: string) => {
    const change = editor.perform.atom.updateAttr(state.id, ["language"], value);
    editor.state.apply([change], { autoCaret: false });
  });

  return (
    <div className="block-kit-x-codeblock">
      <div
        contentEditable={false}
        className="block-kit-x-codeblock-langs"
        onMouseDown={preventNativeEvent}
      >
        <Selector
          id={CODE_SELECTOR_ID}
          disabled={readonly}
          value={data.language || DEFAULT_LANGUAGE}
          onChange={value => onLanguageChange(value)}
          options={SUPPORTED_LANGUAGES}
        ></Selector>
      </div>
      <BlockXModel editor={editor} state={context.state}></BlockXModel>
    </div>
  );
};
