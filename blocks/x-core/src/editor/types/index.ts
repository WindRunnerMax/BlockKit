import type { EditorSchema, LOG_LEVEL } from "@block-kit/core";
import type { O } from "@block-kit/utils/dist/es/types";
import type { BlockMap } from "@block-kit/x-json";

import type { EditorXSchema } from "../../schema/types";

export type EditorOptions = {
  /** 初始渲染数据 */
  initial?: BlockMap;
  /** 日志等级 */
  logLevel?: O.Values<typeof LOG_LEVEL>;
  /** 块编辑器预设渲染规则 */
  schema?: EditorXSchema;
  /** 文本编辑器预设渲染规则 */
  textSchema?: EditorSchema;
};
