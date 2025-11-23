import { Editor, LOG_LEVEL } from "@block-kit/core";
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
import { useMemo } from "react";
import ReactDOM from "react-dom";

import { SCHEMA } from "../react/config/schema";
import { INIT } from "./config/blocks";

const App: FC = () => {
  const block = useMemo(() => {
    return new BlockEditor({ initial: INIT, logLevel: LOG_LEVEL.DEBUG });
  }, []);

  const onCreateTextEditor = (delta: Delta) => {
    const instance = new Editor({ schema: SCHEMA, delta });
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
    <BlockKitX editor={block} onCreateTextEditor={onCreateTextEditor}>
      <EditableX></EditableX>
    </BlockKitX>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
