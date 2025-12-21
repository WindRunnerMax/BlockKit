import type { O } from "@block-kit/utils/dist/es/types";
import type { EditorSchema } from "@block-kit/variable";
import { Delta, SEL_KEY, SEL_VALUE_KEY } from "@block-kit/variable";
import { VARS_KEY, VARS_VALUE_KEY } from "@block-kit/variable";
import { SKILL_KEY } from "@block-kit/variable";

export const SCHEMA: EditorSchema = {
  [VARS_KEY]: { void: true, inline: true },
  [SEL_KEY]: { void: true, inline: true },
  [SKILL_KEY]: { void: true, inline: true },
};

export const PLACEHOLDERS: O.Map<string> = {
  role: "[职业]",
  theme: "[主题]",
  platform: "[平台: 如公众号、知乎、头条等]",
};

export const SELECTOR: O.Map<string[]> = {
  space: ["简练", "中等", "长篇"],
};

export const DELTA = new Delta()
  .insert(" ", {
    [SKILL_KEY]: "帮我写作",
  })
  .insert("我是一位")
  .insert(" ", {
    [VARS_KEY]: "role",
    [VARS_VALUE_KEY]: "博主",
  })
  .insert("，帮我写一篇关于")
  .insert(" ", {
    [VARS_KEY]: "theme",
  })
  .insert("的")
  .insert(" ", {
    [VARS_KEY]: "platform",
  })
  .insert("文章，需要符合该平台写作风格，文章篇幅为")
  .insert(" ", {
    [SEL_KEY]: "space",
    [SEL_VALUE_KEY]: "中等",
  })
  .insert("。");
