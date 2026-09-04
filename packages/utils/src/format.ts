import { DateTime } from "./date-time";
import { isArray } from "./is";
import type { Func, O } from "./types";

export class Format {
  /**
   * 格式化字符串
   * @param str
   * @param data
   * @example ("1{{0}}1", [1]) => "111"
   * @example ("1{{id}}1", { id: 1 }) => "111"
   */
  public static string(str: string, data: O.Map<string> | string[]): string {
    if (isArray(data)) {
      return str.replace(/{{(\d+)}}/g, (match, $1) => data[$1] || match);
    }
    return str.replace(/{{(.*?)}}/g, (match, $1) => data[$1] || match);
  }

  /**
   * 格式化数字
   * @param number
   * @param locale
   * @example 1123 => "1,123"
   */
  public static number(
    number: number,
    locale: string = "en-US",
    options?: Func.InstanceArgs<typeof Intl.NumberFormat>["1"]
  ): string {
    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * 格式化字节数
   * @param bytes
   * @param decimals
   * @example 1024 => "1 KB"
   */
  public static bytes(bytes: number, decimals = 2): string {
    if (!bytes) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    return `${(bytes / 1024 ** i).toFixed(decimals)} ${sizes[i]}`;
  }

  /**
   * 格式化经过的时间
   * @param ms
   * @param relative
   * @example (2000, 1000) => "1 second ago"
   */
  public static time(ms: number, relative: number = Date.now()): string {
    const diff = new DateTime(ms).diff(new DateTime(relative));
    const flags = ["years", "months", "days", "hours", "minutes", "seconds"] as const;
    for (const flag of flags) {
      const value = diff[flag];
      if (value) {
        return `${value} ${value > 1 ? flag : flag.slice(0, -1)} ago`;
      }
    }
    return "just now";
  }
}
