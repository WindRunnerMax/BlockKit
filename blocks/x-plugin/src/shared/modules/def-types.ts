/* eslint-disable @typescript-eslint/no-namespace */

class SharedTypes {
  public static string(defaultValue: string): string;
  public static string(defaultValue?: string): string | undefined;
  public static string(defaultValue?: string): string | undefined {
    return defaultValue;
  }
}

namespace SharedTypes {
  export type infer<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
  } & {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
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
