/* eslint-disable @typescript-eslint/no-namespace */
import { isNil } from "@block-kit/utils";
import type { P } from "@block-kit/utils/dist/es/types";

/**
 * 共享类型 Shared Types
```js
const block = {
  constType: st.string<"ALIGN">("ALIGN"),
  optionalType: st.string(),
  nonOptionalType: st.string("-"),
  optionalWithDefault: st.string("-" as string | null),
};
type Module = st.infer<typeof block>;
```
 */
class SharedTypes {
  public static string<T = string>(defaultValue: T): T;
  public static string<T = string>(defaultValue?: T): T | null;
  public static string<T = string>(defaultValue?: T): T | null {
    return isNil(defaultValue) ? null : defaultValue;
  }

  public static number<T = number>(defaultValue: T): T;
  public static number<T = number>(defaultValue?: T): T | null;
  public static number<T = number>(defaultValue?: T): T | null {
    return isNil(defaultValue) ? null : defaultValue;
  }

  public static array<T extends P.Any[]>(defaultValue: T): T;
  public static array<T extends P.Any[]>(defaultValue?: T): T | null;
  public static array<T extends P.Any[]>(defaultValue?: T): T | null {
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

import st = SharedTypes;
export { st };
