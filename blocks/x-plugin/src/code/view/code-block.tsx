import "../styles/index.scss";

import type { BlockEditor } from "@block-kit/x-core";
import type { BlockModule } from "@block-kit/x-json";
import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXModel } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect } from "react";

import { DEFAULT_LANGUAGE } from "../utils/constant";

export const CodeBlock: FC<{
  editor: BlockEditor;
  context: ReactBlockContext;
}> = props => {
  const { editor, context } = props;
  const data = context.state.data as BlockModule["code"];

  useEffect(() => {
    const lang = data.language || DEFAULT_LANGUAGE;
    const ops = data.delta || [];
    const code = ops.map(op => op.insert).join("");
    import("../utils/parser").then(m => {
      const delta = m.tokenize(code, lang);
      const change = editor.perform.atom.updateText(context.state.id, delta);
      editor.state.apply([change], { autoCaret: false, undoable: false, client: true });
    });
  }, [context.state.id, data.delta, data.language, editor.perform.atom, editor.state]);

  return (
    <div className="block-kit-x-codeblock">
      <BlockXModel editor={editor} state={context.state}></BlockXModel>
    </div>
  );
};
