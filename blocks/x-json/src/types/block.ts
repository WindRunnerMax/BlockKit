import type { Op as JSONOp } from "@block-kit/ot-json";

import type { BasicBlock, BlockModule } from "./interface";

/** Block 数据模块类型 */
export type BlockModuleField = BlockModule[keyof BlockModule];

/** Block 数据类型字段 */
export type BlockDataField = BasicBlock & BlockModuleField;

/** Block 数据类型 */
export type BlockDataType<T extends keyof BlockModule> = BasicBlock & BlockModule[T];

/** Block 类型 */
export type Block = {
  id: string;
  version: number;
  data: BlockDataField;
};

/** Block 数据集合 */
export type Blocks = Record<string, Block>;

/** Block 数据集合 [Alias Blocks] */
export type BlockMap = Blocks;

/** Block 变更 */
export type BlockChange = JSONOp[];

/** Blocks 变更 */
export type BlocksChange = Record<string, BlockChange>;
