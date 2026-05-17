import "../styles/tool-basic.scss";

import {
  IconBold,
  IconCode,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
} from "@arco-design/web-react/icon";
import {
  BOLD_KEY,
  INLINE_CODE_KEY,
  ITALIC_KEY,
  STRIKE_KEY,
  UNDERLINE_KEY,
} from "@block-kit/plugin";
import { cs, NIL, TRULY } from "@block-kit/utils";
import type { FC } from "react";
import { Fragment } from "react";

import type { RenderToolbarContext } from "../../toolbar/utils/schedule";
import { FontColorTool } from "./tool-color";
import { LinkTool } from "./tool-link";

export const TextTools: FC<{
  context: RenderToolbarContext;
}> = props => {
  const { keys, forceUpdate, editor, range } = props.context;

  const onExec = (key: string) => {
    editor.perform.applyMarks(range, { [key]: keys[key] ? NIL : TRULY });
    forceUpdate();
  };

  return (
    <Fragment>
      <div
        className={cs("block-kit-x-toolbar-item", keys[BOLD_KEY] && "active")}
        onClick={() => onExec(BOLD_KEY)}
      >
        <IconBold />
      </div>
      <div
        className={cs("block-kit-x-toolbar-item", keys[ITALIC_KEY] && "active")}
        onClick={() => onExec(ITALIC_KEY)}
      >
        <IconItalic />
      </div>
      <div
        className={cs("block-kit-x-toolbar-item", keys[UNDERLINE_KEY] && "active")}
        onClick={() => onExec(UNDERLINE_KEY)}
      >
        <IconUnderline />
      </div>
      <div
        className={cs("block-kit-x-toolbar-item", keys[STRIKE_KEY] && "active")}
        onClick={() => onExec(STRIKE_KEY)}
      >
        <IconStrikethrough />
      </div>
      <LinkTool context={props.context} />
      <div
        className={cs("block-kit-x-toolbar-item", keys[INLINE_CODE_KEY] && "active")}
        onClick={() => onExec(INLINE_CODE_KEY)}
      >
        <IconCode />
      </div>
      <FontColorTool context={props.context} />
    </Fragment>
  );
};
