import type { O } from "@block-kit/utils/dist/es/types";

export type EditablePluginOptions = {
  placeholders?: O.Map<string>;
  onKeydown?: (e: KeyboardEvent) => void;
};

export type SelectorPluginOptions = {
  selector?: O.Map<string[]>;
  optionsWidth?: number;
};

export type SkillPluginOptions = {
  cleanable?: boolean;
};
