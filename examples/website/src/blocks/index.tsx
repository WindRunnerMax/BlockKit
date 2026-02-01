import "./styles/index.scss";

import { LOG_LEVEL } from "@block-kit/core";
import { BlockEditor } from "@block-kit/x-core";
import {
  AlignXPlugin,
  BulletXPlugin,
  HeadingXPlugin,
  IndentXPlugin,
  QuoteXPlugin,
  TextXPlugin,
} from "@block-kit/x-plugin";
import { BlockKitX, EditableX } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { SCHEMA } from "../react/config/schema";
import { INIT } from "./config/blocks";

const App: FC = () => {
  const block = useMemo(() => {
    const instance = new BlockEditor({
      initial: INIT,
      logLevel: LOG_LEVEL.DEBUG,
      textSchema: SCHEMA,
    });
    instance.plugin.register([
      new TextXPlugin(),
      new HeadingXPlugin(),
      new AlignXPlugin(),
      new QuoteXPlugin(),
      new BulletXPlugin(),
      new IndentXPlugin(),
    ]);
    return instance;
  }, []);

  useEffect(() => {
    // @ts-expect-error 仅调试用
    window.editor = block;
  }, [block]);

  return (
    <BlockKitX editor={block} readonly={false}>
      <div className="block-kit-editor-container">
        <div className="block-kit-editable-container">
          <div className="block-kit-mount-dom"></div>
          <EditableX placeholder="Input Placeholder..."></EditableX>
        </div>
      </div>
    </BlockKitX>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
