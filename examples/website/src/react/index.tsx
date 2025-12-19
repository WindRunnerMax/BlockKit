import "./styles/index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import {
  AlignPlugin,
  BackgroundPlugin,
  BoldPlugin,
  BulletListPlugin,
  DividerPlugin,
  EmojiPlugin,
  FloatToolbar,
  FontColorPlugin,
  FontSizePlugin,
  HeadingPlugin,
  ImagePlugin,
  IndentPlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LineHeightPlugin,
  LinkPlugin,
  MentionPlugin,
  OrderListPlugin,
  QuotePlugin,
  Shortcut,
  StrikePlugin,
  Toolbar,
  ToolBarMixin as Tools,
  UnderlinePlugin,
} from "@block-kit/plugin";
import { BlockKit, Editable, MountNode } from "@block-kit/react";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";

import { GitHubIcon } from "./components/github";
import { ThemeMode } from "./components/theme";
import { INIT } from "./config/block";
import { SCHEMA } from "./config/schema";

const App: FC = () => {
  const [readonly] = useState(false);

  const editor = useMemo(() => {
    const instance = new Editor({ schema: SCHEMA, delta: INIT, logLevel: LOG_LEVEL.DEBUG });
    instance.plugin.register([
      new BoldPlugin(),
      new ItalicPlugin(),
      new UnderlinePlugin(instance),
      new StrikePlugin(instance),
      new ImagePlugin(instance),
      new InlineCodePlugin(instance),
      new HeadingPlugin(instance),
      new AlignPlugin(instance),
      new LineHeightPlugin(instance),
      new FontSizePlugin(instance),
      new FontColorPlugin(instance),
      new BackgroundPlugin(instance),
      new DividerPlugin(instance),
      new BulletListPlugin(instance),
      new OrderListPlugin(instance),
      new IndentPlugin(instance),
      new LinkPlugin(instance),
      new QuotePlugin(instance),
      new EmojiPlugin(instance),
      new MentionPlugin(instance),
      new Shortcut(instance),
    ]);
    return instance;
  }, []);

  useEffect(() => {
    // @ts-expect-error 仅调试用
    window.editor = editor;
    // @ts-expect-error 仅调试用
    window.Delta = Delta;
  }, [editor]);

  const onMountRef = (e: HTMLElement | null) => {
    e && MountNode.set(editor, e);
  };

  return (
    <BlockKit editor={editor} readonly={readonly}>
      <div className="block-kit-editor-container">
        <Toolbar className="block-kit-toolbar">
          <Tools.Bold></Tools.Bold>
          <Tools.Italic></Tools.Italic>
          <Tools.Underline></Tools.Underline>
          <Tools.Strike></Tools.Strike>
          <Tools.Link></Tools.Link>
          <Tools.InlineCode></Tools.InlineCode>
          <Tools.Cut></Tools.Cut>
          <Tools.FontSize></Tools.FontSize>
          <Tools.FontColor></Tools.FontColor>
          <Tools.Cut></Tools.Cut>
          <Tools.Heading></Tools.Heading>
          <Tools.Align></Tools.Align>
          <Tools.LineHeight></Tools.LineHeight>
          <Tools.Cut></Tools.Cut>
          <Tools.Quote></Tools.Quote>
          <Tools.BulletList></Tools.BulletList>
          <Tools.OrderList></Tools.OrderList>
          <Tools.Cut></Tools.Cut>
          <Tools.Image></Tools.Image>
          <Tools.Divider></Tools.Divider>
          <Tools.Emoji></Tools.Emoji>
          <Tools.Cut></Tools.Cut>
          <Tools.History></Tools.History>
          <Tools.Cut></Tools.Cut>
          <ThemeMode></ThemeMode>
          <GitHubIcon></GitHubIcon>
        </Toolbar>
        <FloatToolbar offsetTop={-8}>
          <Tools.Bold></Tools.Bold>
          <Tools.Italic></Tools.Italic>
          <Tools.Underline></Tools.Underline>
          <Tools.Strike></Tools.Strike>
          <Tools.Link></Tools.Link>
          <Tools.InlineCode></Tools.InlineCode>
          <Tools.FontSize></Tools.FontSize>
          <Tools.FontColor></Tools.FontColor>
          <Tools.LineHeight></Tools.LineHeight>
        </FloatToolbar>
        {/* 保证 relative, mount-dom 则保证 absolute, 以此挂载辅助节点 */}
        <div className="block-kit-editable-container">
          <div className="block-kit-mount-dom" ref={onMountRef}></div>
          <Editable
            placeholder="Please Enter..."
            autoFocus
            className="block-kit-editable"
          ></Editable>
        </div>
      </div>
    </BlockKit>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
