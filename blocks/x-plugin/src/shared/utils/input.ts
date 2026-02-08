import { preventContextEvent } from "@block-kit/plugin";
import type { EventContext } from "@block-kit/utils";
import type { Range } from "@block-kit/x-core";
import type { BlockEditor } from "@block-kit/x-core";
import type { BlockDataField } from "@block-kit/x-json";

/**
 * 输入回车时继承当前行属性
 * - 会覆盖 data 的 delta 属性, 回车可能会切割文本
 * - 会覆盖 data 的 children 属性, 避免渲染引用问题
 */
export const inheritLineProperties = (
  editor: BlockEditor,
  event: InputEvent,
  context: EventContext,
  selection: Range,
  data: BlockDataField
) => {
  const copied: BlockDataField = { ...data };
  const { inputType } = event;
  switch (inputType) {
    case "insertLineBreak":
    case "insertParagraph": {
      copied.delta = [];
      copied.children = [];
      const res = editor.perform.insertBreak(selection, copied);
      preventContextEvent(event, context);
      return res;
    }
  }
};
