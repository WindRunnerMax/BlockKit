import { st } from "../../shared/modules/shared-types";

export const TABLE_KEY = "table" as const;
export const TABLE_CELL_KEY = "table-cell" as const;
export const MIN_CELL_WIDTH = 100;

export type CellConfig = {
  width?: number;
  colSpan?: number;
  rowSpan?: number;
};

export const DEFINE_TABLE_TYPE = {
  type: st.string(TABLE_KEY),
  size: st.array<[rows: number, cols: number]>([2, 2]),
  config: st.array<CellConfig[]>([]),
};

export type TableBlockDataType = st.infer<typeof DEFINE_TABLE_TYPE>;

declare module "@block-kit/x-json/dist/es/types/interface" {
  interface BlockModule {
    [TABLE_KEY]: TableBlockDataType;
    [TABLE_CELL_KEY]: { type: typeof TABLE_CELL_KEY };
  }
}
