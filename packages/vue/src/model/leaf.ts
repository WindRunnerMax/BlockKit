import type { Editor, LeafState } from "@block-kit/core";
import { LEAF_KEY, PLUGIN_TYPE } from "@block-kit/core";
import type { P } from "@block-kit/utils/dist/es/types";
import { computed, defineComponent, h, toRaw } from "vue";

import type { VueLeafContext } from "../plugin/types";
import { Text } from "../preset/text";
import { LEAF_TO_TEXT as LT } from "../utils/weak-map";

export type LeafModelProps = {
  editor: Editor;
  index: number;
  leafState: LeafState;
};

export const LeafModel = /*#__PURE__*/ defineComponent<LeafModelProps>({
  name: "LeafModel",
  props: ["editor", "index", "leafState"],
  setup: props => {
    const setModel = (dom: P.Any) => {
      if (dom instanceof HTMLSpanElement) {
        props.editor.model.setLeafModel(dom, toRaw(props.leafState));
      }
    };

    const runtime = computed(() => {
      const text = props.leafState.getText();
      const context: VueLeafContext = {
        op: props.leafState.op,
        classList: [],
        lineState: props.leafState.parent,
        leafState: props.leafState,
        attributes: props.leafState.op.attributes,
        style: {},
        children: h(Text, {
          ref: (refs: P.Any) => {
            refs && refs.el && LT.set(toRaw(props.leafState), refs.el);
          },
          text: text,
        }),
      };
      const plugins = props.editor.plugin.getPriorityPlugins(PLUGIN_TYPE.RENDER_LEAF);
      for (const plugin of plugins) {
        if (plugin.match(context.attributes || {}, context.op)) {
          context.children = plugin.renderLeaf(context);
        }
      }
      return context;
    });

    return () => {
      return h(
        "span",
        {
          [LEAF_KEY]: true,
          ref: setModel,
          class: runtime.value.classList.join(" "),
          style: runtime.value.style,
        },
        runtime.value.children
      );
    };
  },
});
