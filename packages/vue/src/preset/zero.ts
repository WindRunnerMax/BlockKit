import {
  VOID_LEN_KEY,
  ZERO_EMBED_KEY,
  ZERO_ENTER_KEY,
  ZERO_SPACE_KEY,
  ZERO_SYMBOL,
  ZERO_VOID_KEY,
} from "@block-kit/core";
import { defineComponent, h, ref } from "vue";

import { NO_CURSOR } from "../utils/constant";

export type ZeroSpaceProps = {
  /** 隐藏光标 */
  hide?: boolean;
  /** void-block 空节点 */
  void?: boolean;
  /** embed(inline-block) 嵌入节点 */
  embed?: boolean;
  /** 行末尾占位 */
  enter?: boolean;
  /** 空节点占位长度 */
  len?: number;
};

/**
 * 零宽字符组件
 * - void hide => 独占一行的空节点, 例如 Image
 * - embed => 嵌入节点, 例如 Mention
 * - enter => 行末尾占位, 保留于 EOLView
 * - len => 空节点占位长度, 配合 Void/Embed
 */
export const ZeroSpace = /*#__PURE__*/ defineComponent<ZeroSpaceProps>({
  name: "ZeroSpace",
  props: ["hide", "void", "embed", "enter", "len"],
  setup: (props, { expose }) => {
    const spanRef = ref<HTMLSpanElement | null>(null);

    expose({ el: spanRef });

    return () =>
      h(
        "span",
        {
          ref: spanRef,
          [ZERO_SPACE_KEY]: true,
          [ZERO_VOID_KEY]: props.void,
          [ZERO_ENTER_KEY]: props.enter,
          [ZERO_EMBED_KEY]: props.embed,
          [VOID_LEN_KEY]: props.len,
          style: props.hide ? NO_CURSOR : undefined,
        },
        ZERO_SYMBOL
      );
  },
});
