import type { EditorSchema } from "@block-kit/core";

import type { EditorXRules } from "./types";

export class Schema {
  /** 编辑器块节点模式规则 */
  public schema: EditorXRules;
  /** 文本编辑器节点模式规则 */
  public textSchema: EditorSchema;
  /** Void */
  public readonly void: Set<string> = new Set<string>();
  /** Mark */
  public readonly mark: Set<string> = new Set<string>();
  /** Block */
  public readonly block: Set<string> = new Set<string>();
  /** Inline */
  public readonly inline: Set<string> = new Set<string>();

  /**
   * 构造函数
   * @param rules
   */
  constructor(rules: EditorXRules, schema: EditorSchema) {
    this.schema = rules;
    this.textSchema = schema;
    for (const [key, value] of Object.entries(schema)) {
      value.void && this.void.add(key);
      value.mark && this.mark.add(key);
      value.block && this.block.add(key);
      value.inline && this.inline.add(key);
    }
  }
}
