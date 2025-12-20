import "./index.scss";
import "@block-kit/variable/src/index.scss";
import "@arco-design/web-react/es/style/index.less";

import { IconArrowUp, IconGithub } from "@arco-design/web-react/icon";
import { cs, preventNativeEvent } from "@block-kit/utils";
import { Editor, LOG_LEVEL, SelectorInputPlugin, SkillInputPlugin } from "@block-kit/variable";
import { Delta } from "@block-kit/variable";
import { BlockKit, Editable } from "@block-kit/variable";
import { EditableInputPlugin } from "@block-kit/variable";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { DELTA, PLACEHOLDERS, SCHEMA, SELECTOR } from "./constant";

const App: FC = () => {
  const editor = useMemo(() => {
    // 需要保证 Editor 实例的稳定, 不能重复创建实例, 即 useMemo 的依赖数组需要为 []
    const instance = new Editor({ schema: SCHEMA, delta: DELTA, logLevel: LOG_LEVEL.DEBUG });
    instance.plugin.register([
      new EditableInputPlugin({ placeholders: PLACEHOLDERS }),
      new SelectorInputPlugin({ selector: SELECTOR }),
      new SkillInputPlugin(),
    ]);
    return instance;
  }, []);

  useEffect(() => {
    // @ts-expect-error 仅调试用
    window.editor = editor;
    // @ts-expect-error 仅调试用
    window.Delta = Delta;
  }, [editor]);

  const onSendMessage = () => {
    const delta = editor.state.block.toDelta();
    console.log("Message:", delta.ops);
  };

  return (
    <div className="vars-input-container-wrapper">
      <div className="vars-input-title">变量模板输入框</div>
      <div className="vars-input-container">
        <BlockKit editor={editor} readonly={/** 文本区域只读模式 */ false}>
          <Editable className="block-kit-editable" placeholder="描述你要创作的内容..."></Editable>
        </BlockKit>
        <div className="vars-input-footer" onMouseDown={preventNativeEvent} onClick={onSendMessage}>
          <div className="vars-input-send">
            <IconArrowUp />
          </div>
        </div>
      </div>
      <a
        className={cs("github-link")}
        href="https://github.com/WindRunnerMax/BlockKit/tree/master/examples/variable"
        target="_blank"
      >
        <IconGithub />
      </a>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
