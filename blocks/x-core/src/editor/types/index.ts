import type { LOG_LEVEL } from "@block-kit/core";
import type { O } from "@block-kit/utils/dist/es/types";
import type { Blocks } from "@block-kit/x-json";

export type EditorOptions = {
  /** 初始渲染数据 */
  initial?: Blocks;
  /** 日志等级 */
  logLevel?: O.Values<typeof LOG_LEVEL>;
};
