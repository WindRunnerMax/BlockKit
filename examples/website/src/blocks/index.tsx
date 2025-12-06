import "./styles/index.scss";

import { Editor as TextEditor, LOG_LEVEL } from "@block-kit/core";
import type { Delta } from "@block-kit/delta";
import {
  BackgroundPlugin,
  BoldPlugin,
  FontColorPlugin,
  FontSizePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LinkPlugin,
  StrikePlugin,
  UnderlinePlugin,
} from "@block-kit/plugin";
import { BlockEditor } from "@block-kit/x-core";
import { BlockKitX, EditableX } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { SCHEMA } from "../react/config/schema";
import { INIT } from "./config/blocks";

const App: FC = () => {
  const block = useMemo(() => {
    const instance = new BlockEditor({ initial: INIT, logLevel: LOG_LEVEL.DEBUG });
    return instance;
  }, []);

  useEffect(() => {
    // @ts-expect-error 仅调试用
    window.editor = block;
  }, [block]);

  const onCreateTextEditor = (delta: Delta) => {
    const instance = new TextEditor({ schema: SCHEMA, delta });
    instance.plugin.register([
      new BoldPlugin(),
      new ItalicPlugin(),
      new UnderlinePlugin(instance),
      new StrikePlugin(instance),
      new InlineCodePlugin(instance),
      new FontSizePlugin(instance),
      new FontColorPlugin(instance),
      new BackgroundPlugin(instance),
      new LinkPlugin(instance),
    ]);
    return instance;
  };

  return (
    <BlockKitX editor={block} onCreateTextEditor={onCreateTextEditor} readonly={false}>
      <div className="block-kit-editor-container">
        <div className="block-kit-editable-container">
          <div className="block-kit-mount-dom"></div>
          <EditableX placeholder="Input Placeholder..." className="block-kit-editable"></EditableX>
        </div>
      </div>
    </BlockKitX>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
