import type { EditorSchema } from "@block-kit/core";

export const SCHEMA: EditorSchema = {
  "bold": { mark: true },
  "italic": { mark: true },
  "underline": { mark: true },
  "strike": { mark: true },
  "inline-code": { mark: true, inline: true },
  "link": { mark: true, inline: true },
  "link-blank": { mark: true, inline: true },
  "color": { mark: true },
  "font-size": { mark: true },
  "background": { mark: true },
  "image": { block: true, void: true },
  "mention": { void: true, inline: true },
  "divider": { block: true, void: true },
  "emoji": { void: true, inline: true },
  "_client_code-hl": { mark: true },
};
