import "./styles/index.scss";

import { Editor, LOG_LEVEL } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { BlockKit, Editable } from "@block-kit/vue";
import { computed, createApp, defineComponent, h, onMounted, ref } from "vue";

import { INIT } from "./config/block";
import { schema } from "./config/schema";

const App = defineComponent({
  name: "App",
  setup() {
    const readonly = ref(false);
    const editor = computed(() => {
      const instance = new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG, schema });
      return instance;
    });

    onMounted(() => {
      // @ts-expect-error editor
      window.editor = editor.value;
      // @ts-expect-error BlockDelta
      window.Delta = Delta;
    });

    return () =>
      h(
        BlockKit,
        {
          editor: editor.value,
          readonly: readonly.value,
        },
        {
          default: () => {
            return h("div", { class: "block-kit-editable-container" }, [
              h("div", { class: "block-kit-mount-dom" }),
              h(Editable, {
                placeholder: "Please Enter...",
                autoFocus: true,
                class: "block-kit-editable",
              }),
            ]);
          },
        }
      );
  },
});

createApp(App).mount("#root");
