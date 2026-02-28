/* eslint-disable @typescript-eslint/no-namespace */
import { isNil } from "@block-kit/utils";

class SharedTypes {
  public static string(defaultValue: string): string;
  public static string(defaultValue?: string): string | null;
  public static string(defaultValue?: string): string | null {
    return isNil(defaultValue) ? null : defaultValue;
  }
}

namespace SharedTypes {
  export type infer<T> = {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
  } & {
    [K in keyof T as null extends T[K] ? never : K]: T[K];
  };
}

/** 共享类型 Shared Types */
import st = SharedTypes;
export { st };

export const s = {
  align: st.string("1"),
  align2: st.string(),
};

export type s = st.infer<typeof s>;
