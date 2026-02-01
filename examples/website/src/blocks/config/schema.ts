import type { EditorXSchema } from "@block-kit/x-core";
import { CODE_KEY } from "@block-kit/x-plugin";

export const RULES: EditorXSchema = {
  [CODE_KEY]: { box_text: true },
};
