import type { O } from "@block-kit/utils/dist/es/types";
import type React from "react";

export type EditablePluginOptions = {
  placeholders?: O.Map<string>;
  onKeydown?: React.KeyboardEventHandler<HTMLDivElement>;
};

export type SelectorPluginOptions = {
  selector?: O.Map<string[]>;
  optionsWidth?: number;
};

export type SkillPluginOptions = {
  cleanable?: boolean;
};
