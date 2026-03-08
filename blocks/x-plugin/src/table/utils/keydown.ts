import { preventContextEvent } from "@block-kit/plugin";
import type { EventContext } from "@block-kit/utils";
import { isKeyCode, KEY_CODE } from "@block-kit/utils";
import type { BlockEditor } from "@block-kit/x-core";
import type { ApplyChange } from "@block-kit/x-core";
import { Point } from "@block-kit/x-core";

import { TEXT_KEY } from "../../text/types";
import { TABLE_CELL_KEY } from "../types";

export const onTableKeydown = (editor: BlockEditor, e: KeyboardEvent, context: EventContext) => {
  BACK_SPACE: if (isKeyCode(e, KEY_CODE.BACKSPACE)) {
    const sel = editor.selection.get();
    CELL_TOP_TEXT: {
      const point = sel && sel.isCollapsed && sel.getFirstPoint();
      const block = point && editor.state.getBlock(point.id);
      const cell = block && block.parent;
      if (!cell || cell.data.type !== TABLE_CELL_KEY) {
        break CELL_TOP_TEXT;
      }
      // 如果当前点是单元格的第一个文本节点, 且偏移量为 0, 则阻止默认事件
      if (point.id === cell.data.children[0] && Point.isText(point) && point.offset === 0) {
        preventContextEvent(e, context);
        break BACK_SPACE;
      }
    }
    SELECT_CELLS: {
      const entry = sel && sel.length && sel.at(0);
      const block = entry && editor.state.getBlock(entry.id);
      if (!block || block.data.type !== TABLE_CELL_KEY) {
        break SELECT_CELLS;
      }
      const atom = editor.perform.atom;
      const changes: ApplyChange[] = [];
      for (const node of sel.nodes) {
        const cell = node && editor.state.getBlock(node.id);
        if (!cell || cell.data.type !== TABLE_CELL_KEY) {
          break SELECT_CELLS;
        }
        for (let i = 0; i < cell.children.length; ++i) {
          const change = atom.updateListNode(cell.id, ["children", i], undefined);
          changes.push(change);
        }
        const newTextBlock = atom.create({ type: TEXT_KEY, children: [], delta: [] });
        const insert = atom.insert(cell.id, 0, newTextBlock);
        changes.push(newTextBlock, ...insert);
      }
      editor.state.apply(changes, { autoCaret: false });
      preventContextEvent(e, context);
    }
  }
};
