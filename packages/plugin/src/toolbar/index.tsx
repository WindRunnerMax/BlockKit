import "./styles/index.scss";

import { EDITOR_EVENT } from "block-kit-core";
import type { Op } from "block-kit-delta";
import { useEditorStatic } from "block-kit-react";
import { cs } from "block-kit-utils";
import { useMemoFn } from "block-kit-utils/dist/es/hooks";
import { useEffect, useState } from "react";

import { ToolbarContext } from "./context/provider";
import { Align } from "./modules/align";
import { Bold } from "./modules/bold";
import { BulletList } from "./modules/bullet-list";
import { Cut } from "./modules/cut";
import { Divider } from "./modules/divider";
import { FontColor } from "./modules/font-color";
import { FontSize } from "./modules/font-size";
import { Heading } from "./modules/heading";
import { History } from "./modules/history";
import { Image } from "./modules/image";
import { InlineCode } from "./modules/inline-code";
import { Italic } from "./modules/italic";
import { LineHeight } from "./modules/line-height";
import { Link } from "./modules/link";
import { OrderList } from "./modules/order-list";
import { Strike } from "./modules/strike";
import { Underline } from "./modules/underline";
import type { ToolbarProps } from "./types";
import { filterLineMarkMap, filterMarkMap } from "./utils/marks";

export const Toolbar = (props: ToolbarProps) => {
  const { editor } = useEditorStatic();
  const [keys, setKeys] = useState<Record<string, string>>({});

  const refreshMarks = useMemoFn(() => {
    const current = editor.selection.get();
    if (!current) {
      setKeys({});
      return void 0;
    }
    const lines = editor.state.block.getLines();
    const { start, end } = current;
    const lineMarkMap = filterLineMarkMap(
      lines.slice(start.line, end.line + 1).map(line => line.attributes)
    );
    if (current.isCollapsed) {
      setKeys({ ...editor.collect.marks, ...lineMarkMap });
      return void 0;
    }
    const ops: Op[] = [];
    if (current.isCollapsed) {
      const op = editor.collect.getOpAtPoint(current.start);
      op && ops.push(op);
    } else {
      const fragment = editor.collect.getFragment();
      fragment && ops.push(...fragment);
    }
    const markMap = filterMarkMap(ops);
    setKeys({ ...markMap, ...lineMarkMap });
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    };
  }, [editor.event, refreshMarks]);

  return (
    <div
      className={cs("block-kit-menu-toolbar", props.className)}
      onMouseDown={e => {
        const target = e.target;
        // 存在需要抢夺焦点的情况, 例如超链接输入的弹出层
        if (target instanceof HTMLElement && target.hasAttribute("data-no-prevent")) {
          return void 0;
        }
        e.preventDefault();
      }}
    >
      <ToolbarContext.Provider
        value={{
          keys,
          editor,
          setKeys,
          refreshMarks,
          selection: editor.selection.get(),
        }}
      >
        {props.children}
      </ToolbarContext.Provider>
    </div>
  );
};

Toolbar.Cut = Cut;
Toolbar.Bold = Bold;
Toolbar.Link = Link;
Toolbar.Image = Image;
Toolbar.Align = Align;
Toolbar.Italic = Italic;
Toolbar.Strike = Strike;
Toolbar.History = History;
Toolbar.Heading = Heading;
Toolbar.Divider = Divider;
Toolbar.FontSize = FontSize;
Toolbar.FontColor = FontColor;
Toolbar.OrderList = OrderList;
Toolbar.Underline = Underline;
Toolbar.BulletList = BulletList;
Toolbar.InlineCode = InlineCode;
Toolbar.LineHeight = LineHeight;
